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
 * The session lookup, balance check, debit, credits, and history writes all run
 * inside a single transaction. Moving the session lookup inside prevents a race
 * where the session ends between the preflight check and the balance debit.
 */
export async function executeTip(
  guildId: string,
  channelId: string,
  senderId: string,
  amount: number,
  tipMessage?: string,
): Promise<TipResult> {
  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.toyControl.findFirst({
      where: { guildId, channelId, active: true },
      include: { participants: true },
    });

    if (!session) {
      throw new UserFacingError(
        "There is no active toy control session in this channel. Start one with /toy-session first.",
      );
    }

    // Exclude the sender so tips actually transfer tokens between users.
    // If the sender is the only participant (solo session), reject the tip.
    const receiverIds = session.participants
      .map((p) => p.userId)
      .filter((id) => id !== senderId);

    if (receiverIds.length === 0) {
      throw new UserFacingError("You cannot tip a session you are participating in.");
    }

    // Validate before any writes so the transaction never deducts tokens
    // for an invalid tip amount.
    if (amount < receiverIds.length) {
      throw new UserFacingError(
        `This session has ${receiverIds.length} controlled user(s); the minimum tip is ${receiverIds.length} token(s).`,
      );
    }

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

  // Use a timed Lovense command so the tip burst auto-stops after the window
  // without a separate setTimeout that could fire after a newer session command.
  const tipDurationSec = Math.round(TIP_VIBRATION_DURATION_MS / 1000);
  for (const uid of result.receiverIds) {
    sendVibrate(uid, TIP_VIBRATION_LEVEL, tipDurationSec).catch((err: unknown) =>
      log.warn({ err, uid }, "Tip vibrate failed"),
    );
  }

  return result;
}
