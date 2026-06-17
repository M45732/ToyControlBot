import {
  type Client,
  type Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";

import { prisma } from "../../services/database.service.js";
import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";
import { sendVibrate } from "./lovense.client.js";
import type { SessionMode } from "./session.types.js";

const log = createLogger("session");

const VOTE_INTERVAL_MS = 5_000;
const VOTE_EMOJIS = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"] as const;

/** In-memory registry: messageId → interval handle */
const activeLoops = new Map<string, ReturnType<typeof setInterval>>();

/**
 * Channels where a session start is in progress. Guards against two concurrent
 * /toy-session calls both passing the DB check before either inserts a row.
 * Safe because Node.js is single-threaded: the has()+add() pair runs without
 * any await in between, so it is atomic within the event loop.
 */
const pendingChannels = new Set<string>();

/** Map a vote level (0–5) to a Lovense API vibration value (0–20). */
function levelToVibration(level: number): number {
  return level === 0 ? 0 : level * 4;
}

function buildSessionEmbed(
  mode: SessionMode,
  ownerId: string,
  userIds: string[],
  votedLevel: number,
  voteBreakdown: string | null,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(
      `Toy Control — ${mode === "gangbang" ? "Gangbang" : "Orgy"} Session`,
    )
    .setColor(0x02e3f3)
    .setTimestamp();

  const usersText =
    userIds.length > 0 ? userIds.map((id) => `<@${id}>`).join(", ") : `<@${ownerId}>`;

  embed.addFields(
    { name: "Controlled", value: usersText, inline: true },
    { name: "Voted Speed", value: `**${votedLevel}**/5`, inline: true },
  );

  if (voteBreakdown) {
    embed.addFields({ name: "Last Vote Result", value: voteBreakdown });
  }

  embed.setFooter({
    text:
      mode === "gangbang"
        ? "React 0️⃣–5️⃣ to vote the vibration level"
        : "React 0️⃣–5️⃣ to vote | Use the button below to join as controlled",
  });

  return embed;
}

function buildSessionRow(
  mode: SessionMode,
  messageId: string,
): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("session:leave")
      .setLabel("⏹ End/Leave")
      .setStyle(ButtonStyle.Danger),
  );
  if (mode === "orgy") {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`session:join:${messageId}`)
        .setLabel("➕ Get Controlled")
        .setStyle(ButtonStyle.Success),
    );
  }
  return row;
}

/**
 * Start a new control session, post the session message, add reactions, and
 * start the periodic vote loop.
 */
export async function startSession(
  client: Client,
  guildId: string,
  channelId: string,
  ownerId: string,
  mode: SessionMode,
): Promise<string> {
  // Prevent a user from running two sessions simultaneously — concurrent vote
  // loops for the same Lovense uid would race and produce unpredictable output.
  const alreadyParticipating = await prisma.toyControlUser.findFirst({
    where: { userId: ownerId, session: { active: true } },
  });
  if (alreadyParticipating) {
    throw new UserFacingError(
      "You're already in an active session. Leave it first before starting a new one.",
    );
  }

  // Enforce one active session per channel so /tip always has a clear target.
  // The pendingChannels Set closes the TOCTOU window between the DB check and
  // the DB insert (which can't be placed in a single transaction because the
  // Discord message send happens in between).
  if (pendingChannels.has(channelId)) {
    throw new UserFacingError(
      "A session is already being started in this channel. Please wait a moment.",
    );
  }
  const existingChannelSession = await prisma.toyControl.findFirst({
    where: { channelId, active: true },
  });
  if (existingChannelSession) {
    throw new UserFacingError(
      "There is already an active session in this channel. End it before starting a new one.",
    );
  }
  pendingChannels.add(channelId);

  const channel = await client.channels.fetch(channelId);
  if (!(channel instanceof TextChannel)) {
    throw new Error("Session channel is not a text channel");
  }

  const embed = buildSessionEmbed(mode, ownerId, [ownerId], 0, null);
  const placeholderRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("session:leave")
      .setLabel("⏹ End/Leave")
      .setStyle(ButtonStyle.Danger),
  );

  const sessionMsg = await channel.send({ embeds: [embed], components: [placeholderRow] });

  // Update buttons now that we have the real message ID (join button needs it)
  if (mode === "orgy") {
    await sessionMsg.edit({ components: [buildSessionRow(mode, sessionMsg.id)] });
  }

  let session: Awaited<ReturnType<typeof prisma.toyControl.create>>;
  try {
    session = await prisma.toyControl.create({
      data: {
        guildId,
        channelId,
        messageId: sessionMsg.id,
        ownerId,
        sessionMode: mode,
        active: true,
        participants: { create: { userId: ownerId } },
      },
    });
  } finally {
    pendingChannels.delete(channelId);
  }

  for (const emoji of VOTE_EMOJIS) {
    await sessionMsg
      .react(emoji)
      .catch((err: unknown) => log.warn({ err, emoji }, "Failed to add vote reaction"));
  }

  startVoteLoop(client, session.id, sessionMsg.id, channelId);

  return sessionMsg.id;
}

/**
 * Start the periodic vote-tally loop for a session.
 * Safe to call multiple times — ignores sessions that already have a loop.
 */
export function startVoteLoop(
  client: Client,
  sessionId: string,
  messageId: string,
  channelId: string,
): void {
  if (activeLoops.has(messageId)) return;

  const interval = setInterval(
    () => void runVoteTick(client, sessionId, messageId, channelId),
    VOTE_INTERVAL_MS,
  );
  activeLoops.set(messageId, interval);
  log.info({ messageId, sessionId }, "Vote loop started");
}

async function runVoteTick(
  client: Client,
  sessionId: string,
  messageId: string,
  channelId: string,
): Promise<void> {
  try {
    const session = await prisma.toyControl.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!session?.active) {
      stopVoteLoop(messageId);
      return;
    }

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!(channel instanceof TextChannel)) {
      stopVoteLoop(messageId);
      return;
    }

    let message: Message | null = null;
    try {
      message = await channel.messages.fetch(messageId);
    } catch {
      await endSession(messageId).catch(() => undefined);
      stopVoteLoop(messageId);
      return;
    }

    const votes = VOTE_EMOJIS.map((emoji) => {
      const reaction = message!.reactions.cache.get(emoji);
      return { emoji, count: Math.max(0, (reaction?.count ?? 1) - 1) };
    });

    const winner = votes.reduce((a, b) => (b.count > a.count ? b : a));
    const votedLevel = votes.some((v) => v.count > 0)
      ? parseInt(winner.emoji.charAt(0))
      : 0;

    const userIds = session.participants.map((p) => p.userId);
    for (const uid of userIds) {
      await sendVibrate(uid, levelToVibration(votedLevel)).catch((err: unknown) =>
        log.warn({ err, uid }, "Vibrate command failed"),
      );
    }

    const voteBreakdown = votes.map((v) => `${v.emoji} \`${v.count}\``).join(" | ");
    const updatedEmbed = buildSessionEmbed(
      session.sessionMode as SessionMode,
      session.ownerId,
      userIds,
      votedLevel,
      voteBreakdown,
    );

    await message.edit({ embeds: [updatedEmbed] }).catch(() => undefined);
  } catch (err) {
    log.error({ err, messageId }, "Vote tick error");
  }
}

/**
 * End a session: send level-0 stop to all participants, then mark inactive and
 * stop the vote loop.
 *
 * Because sendVibrate uses timeSec:0 (run until overridden), the toys will
 * otherwise keep vibrating at the last voted level after the session ends.
 */
export async function endSession(messageId: string): Promise<void> {
  const session = await prisma.toyControl.findUnique({
    where: { messageId },
    include: { participants: true },
  });

  if (session) {
    for (const { userId } of session.participants) {
      await sendVibrate(userId, 0).catch((err: unknown) =>
        log.warn({ err, userId }, "Failed to send stop vibration on session end"),
      );
    }
  }

  stopVoteLoop(messageId);
  await prisma.toyControl.updateMany({
    where: { messageId, active: true },
    data: { active: false },
  });
}

function stopVoteLoop(messageId: string): void {
  const handle = activeLoops.get(messageId);
  if (handle !== undefined) {
    clearInterval(handle);
    activeLoops.delete(messageId);
    log.info({ messageId }, "Vote loop stopped");
  }
}

/**
 * Add a user to an existing session.
 * Returns false if the session is inactive, the user is already in this session,
 * or the user is already participating in another active session.
 */
export async function joinSession(messageId: string, userId: string): Promise<boolean> {
  const session = await prisma.toyControl.findUnique({
    where: { messageId },
    select: { id: true, active: true },
  });
  if (!session?.active) return false;

  // Prevent joining a second active session — concurrent vote loops for the
  // same Lovense uid would race and produce unpredictable vibration output.
  const alreadyParticipating = await prisma.toyControlUser.findFirst({
    where: { userId, session: { active: true } },
  });
  if (alreadyParticipating) return false;

  try {
    await prisma.toyControlUser.create({ data: { sessionId: session.id, userId } });
    return true;
  } catch {
    return false; // unique constraint = already joined this session
  }
}

/**
 * Remove a user from a session.
 * Returns "not-found" if the session is inactive or the user is not a participant.
 * Owner or last remaining participant ends the session entirely.
 */
export async function leaveSession(
  messageId: string,
  userId: string,
): Promise<"ended" | "left" | "not-found"> {
  const session = await prisma.toyControl.findUnique({
    where: { messageId },
    include: { participants: true },
  });
  if (!session?.active) return "not-found";

  const isParticipant = session.participants.some((p) => p.userId === userId);
  if (!isParticipant) return "not-found";

  if (session.ownerId === userId || session.participants.length <= 1) {
    await endSession(messageId);
    return "ended";
  }

  // Stop the leaver's toy before removing them — timeSec:0 means it keeps
  // running at the last voted level once they're no longer in the loop.
  await sendVibrate(userId, 0).catch((err: unknown) =>
    log.warn({ err, userId }, "Failed to stop vibration for leaving participant"),
  );

  await prisma.toyControlUser.deleteMany({
    where: { sessionId: session.id, userId },
  });
  return "left";
}

/**
 * Restore active sessions after a bot restart.
 * Orphaned sessions (message deleted) are cleaned up automatically.
 */
export async function restoreActiveSessions(client: Client): Promise<void> {
  const sessions = await prisma.toyControl.findMany({ where: { active: true } });
  log.info({ count: sessions.length }, "Restoring active sessions");

  for (const session of sessions) {
    const channel = await client.channels.fetch(session.channelId).catch(() => null);
    if (!(channel instanceof TextChannel)) {
      await endSession(session.messageId);
      continue;
    }

    const message = await channel.messages.fetch(session.messageId).catch(() => null);
    if (!message) {
      await endSession(session.messageId);
      continue;
    }

    startVoteLoop(client, session.id, session.messageId, session.channelId);
  }
}
