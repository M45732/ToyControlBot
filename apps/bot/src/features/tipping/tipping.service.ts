import { prisma } from "../../services/database.service.js";
import { sendVibrate } from "../lovense/lovense.client.js";
import { createLogger } from "../../lib/logger.js";
import { UserFacingError } from "../../lib/errors.js";

const log = createLogger("tipping");

const TIP_VIBRATION_LEVEL = 15;
const TIP_VIBRATION_DURATION_MS = 5_000;

export interface TipResult {
  readonly amount: number;
  readonly senderId: string;
  readonly receiverIds: string[];
  readonly senderNewBalance: number;
}

/**
 * Execute a tip atomically: check and deduct sender balance, credit each session
 * participant (distributing the full amount with no rounding loss), trigger toy.
 *
 * All balance moves and history writes run inside a single transaction so a
 * partial failure cannot leave the sender debited without receivers credited.
 * The conditional WHERE on `balance >= amount` prevents concurrent tips from
 * the same user from both succeeding when only one has sufficient funds.
 */
export async function executeTip(
  guildId: string,
  channelId: string,
  senderId: string,
  amount: number,
  tipMessage?: string,
): Promise<TipResult> {
  const session = await prisma.toyControl.findFirst({
    where: { guildId, channelId, active: true },
    include: { participants: true },
  });

  if (!session) {
    throw new UserFacingError(
      "There is no active toy control session in this channel. Start one with /toy-session first.",
    );
  }

  const receiverIds = session.participants.map((p) => p.userId);

  const result = await prisma.$transaction(async (tx) => {
    // Atomically check balance and deduct. The conditional WHERE on `balance >= amount`
    // means a concurrent tip that races here will get count=0 and we throw, preventing
    // the balance from going negative.
    const deductResult = await tx.tokenBalance.updateMany({
      where: {
        guildId,
        userId: senderId,
        balance: { gte: amount },
      },
      data: { balance: { decrement: amount } },
    });

    if (deductResult.count === 0) {
      const row = await tx.tokenBalance.findUnique({
        where: { guildId_userId: { guildId, userId: senderId } },
      });
      const current = row?.balance ?? 0;
      throw new UserFacingError(
        `You don't have enough tokens. Your balance is ${current}, tip is ${amount}.`,
      );
    }

    // Record the sender debit in history
    await tx.tokenHistory.create({
      data: { guildId, userId: senderId, amount: -amount, eventType: "tip_send", eventId: session.messageId },
    });

    // Distribute tokens to receivers — give the remainder to the first participant
    // so the total credited always equals the total debited.
    const base = Math.floor(amount / receiverIds.length);
    const remainder = amount - base * receiverIds.length;

    for (let i = 0; i < receiverIds.length; i++) {
      const credit = i === 0 ? base + remainder : base;
      const receiverId = receiverIds[i]!;

      await tx.tokenBalance.upsert({
        where: { guildId_userId: { guildId, userId: receiverId } },
        update: { balance: { increment: credit } },
        create: { guildId, userId: receiverId, balance: credit },
      });
      await tx.tokenHistory.create({
        data: { guildId, userId: receiverId, amount: credit, eventType: "tip_received", eventId: session.messageId },
      });
      await tx.tipHistory.create({
        data: {
          guildId,
          messageId: session.messageId,
          senderId,
          receiverId,
          amount: credit,
          message: tipMessage,
        },
      });
    }

    const row = await tx.tokenBalance.findUnique({
      where: { guildId_userId: { guildId, userId: senderId } },
    });
    return { amount, senderId, receiverIds, senderNewBalance: row?.balance ?? 0 };
  });

  for (const uid of receiverIds) {
    sendVibrate(uid, TIP_VIBRATION_LEVEL).catch((err: unknown) =>
      log.warn({ err, uid }, "Tip vibrate failed"),
    );
  }

  setTimeout(() => {
    for (const uid of receiverIds) {
      sendVibrate(uid, 0).catch(() => undefined);
    }
  }, TIP_VIBRATION_DURATION_MS);

  return result;
}
