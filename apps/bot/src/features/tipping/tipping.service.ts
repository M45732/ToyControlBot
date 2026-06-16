import { prisma } from "../../services/database.service.js";
import { adjustBalance, getBalance } from "../economy/economy.service.js";
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
 * Execute a tip: deduct from sender, credit each session participant, trigger toy.
 * Requires an active toy-control session in the channel.
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
  const senderBalance = await getBalance(guildId, senderId);

  if (senderBalance < amount) {
    throw new UserFacingError(
      `You don't have enough tokens. Your balance is ${senderBalance}, tip is ${amount}.`,
    );
  }

  await adjustBalance(guildId, senderId, -amount, "tip_send", session.messageId);

  const splitAmount = Math.floor(amount / receiverIds.length);
  for (const receiverId of receiverIds) {
    await adjustBalance(guildId, receiverId, splitAmount, "tip_received", session.messageId);
    await prisma.tipHistory.create({
      data: {
        guildId,
        messageId: session.messageId,
        senderId,
        receiverId,
        amount,
        message: tipMessage,
      },
    });
  }

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

  const senderNewBalance = await getBalance(guildId, senderId);
  return { amount, senderId, receiverIds, senderNewBalance };
}
