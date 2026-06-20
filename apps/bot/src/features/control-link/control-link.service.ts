import {
  ActionRowBuilder,
  BaseGuildTextChannel,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Message,
  ThreadChannel,
} from "discord.js";

import { prisma } from "../../services/database.service.js";
import type { ParsedControlLink } from "./control-link.types.js";

const LINK_PATTERNS: Array<{
  pattern: RegExp;
  provider: ParsedControlLink["provider"];
}> = [
  // Lovense Standard API remote-control links (/t2/) and partner-control links (/c/)
  // Match any subdomain of lovense-api.com to cover both api. and c. variants
  {
    pattern: /https?:\/\/[a-z0-9-]+\.lovense-api\.com\/t2\/[^\s]+/i,
    provider: "lovense",
  },
  {
    pattern: /https?:\/\/(?:c\.)?lovense\.com\/c\/[^\s]+/i,
    provider: "lovense",
  },
  // Handyfeeling session/connect links and legacy /remote?<code> format
  {
    pattern:
      /https?:\/\/handyfeeling\.com\/(?:(?:sessions?|connect)\/[^\s]+|remote\?[^\s]+)/i,
    provider: "handyfeeling",
  },
  // xtoys room/toy sharing links and legacy /session/<code> format
  {
    pattern: /https?:\/\/xtoys\.app\/(?:r|rooms?|toys?|sessions?)\/[^\s]+/i,
    provider: "xtoys",
  },
];

/**
 * Scan a message for a known control link.
 */
export function detectControlLink(content: string): ParsedControlLink | null {
  for (const { pattern, provider } of LINK_PATTERNS) {
    const match = content.match(pattern);
    if (match?.[0]) {
      return { url: match[0], provider };
    }
  }
  return null;
}

export async function createRaffle(
  raffleMessageId: string,
  channelId: string,
  guildId: string,
  link: ParsedControlLink,
  hostId: string,
): Promise<void> {
  await prisma.raffle.create({
    data: {
      messageId: raffleMessageId,
      channelId,
      guildId,
      hostId,
      linkUrl: link.url,
      linkProvider: link.provider,
    },
  });
}

/**
 * Returns basic raffle info if the raffle is still active, null otherwise.
 */
export async function getRaffle(
  raffleMessageId: string,
): Promise<{ hostId: string; participantCount: number } | null> {
  const raffle = await prisma.raffle.findUnique({
    where: { messageId: raffleMessageId, active: true },
    select: { hostId: true, _count: { select: { participants: true } } },
  });
  if (!raffle) return null;
  return {
    hostId: raffle.hostId,
    participantCount: raffle._count.participants,
  };
}

/**
 * Attempt to join a raffle. Returns null if the raffle is no longer active,
 * or an object indicating whether the user was newly added and the current
 * participant count.
 *
 * The find and insert run inside a transaction so a concurrent pickWinner
 * that marks the raffle inactive cannot slip between them — the user won't
 * be told they entered when they weren't actually in the winner pool.
 */
export async function joinRaffle(
  raffleMessageId: string,
  userId: string,
): Promise<{ joined: boolean; participantCount: number } | null> {
  return prisma.$transaction(async (tx) => {
    const raffle = await tx.raffle.findUnique({
      where: { messageId: raffleMessageId, active: true },
      select: { id: true },
    });
    if (!raffle) return null;

    let joined = false;
    try {
      await tx.raffleParticipant.create({
        data: { raffleId: raffle.id, userId },
      });
      joined = true;
    } catch {
      // unique constraint — user already entered
    }

    const updated = await tx.raffle.findUnique({
      where: { id: raffle.id },
      select: { _count: { select: { participants: true } } },
    });
    return { joined, participantCount: updated?._count.participants ?? 0 };
  });
}

/**
 * Pick a random winner and return them with the control link.
 *
 * The hostId check, the claim, and the winner selection all happen inside one
 * transaction so two concurrent "Pick Winner" clicks cannot both announce a
 * winner, and a non-host cannot slip through between a separate host check and
 * the claim.
 *
 * Returns null if nobody has entered (raffle stays active), "not-host" if the
 * caller is not the raffle host, or the winner + link on success. The raffle
 * row is deleted on completion so the private URL is not retained.
 */
export async function pickWinner(
  raffleMessageId: string,
  hostId: string,
): Promise<
  { winnerId: string; link: ParsedControlLink } | "not-host" | "empty" | null
> {
  return prisma.$transaction(async (tx) => {
    const raffle = await tx.raffle.findUnique({
      where: { messageId: raffleMessageId, active: true },
      include: { participants: true },
    });
    if (!raffle) return null;
    if (raffle.hostId !== hostId) return "not-host";
    if (raffle.participants.length === 0) return "empty";

    const claim = await tx.raffle.updateMany({
      where: { id: raffle.id, active: true },
      data: { active: false },
    });
    if (claim.count === 0) return null;

    // Delete row (cascade removes participants) — no need to retain the URL.
    await tx.raffle.delete({ where: { id: raffle.id } });

    const participants = raffle.participants.map((p) => p.userId);
    const winnerId =
      participants[Math.floor(Math.random() * participants.length)]!;
    return {
      winnerId,
      link: {
        url: raffle.linkUrl,
        provider: raffle.linkProvider as ParsedControlLink["provider"],
      },
    };
  });
}

export async function deleteRaffle(raffleMessageId: string): Promise<void> {
  await prisma.raffle.deleteMany({ where: { messageId: raffleMessageId } });
}

/**
 * Build and post the raffle embed for a newly detected control link, then
 * persist the raffle to the database and update the button customIds with
 * the real message ID.
 *
 * Shared by messageCreate and messageUpdate so the raffle posting logic
 * lives in one place.
 */
export async function postRaffleEmbed(
  channel: BaseGuildTextChannel | ThreadChannel,
  authorId: string,
  guildId: string,
  channelId: string,
  link: ParsedControlLink,
): Promise<void> {
  const embed = new EmbedBuilder()
    .setTitle("Control Link Raffle")
    .setDescription(
      `<@${authorId}> shared a **${link.provider}** control link!\n\nClick **Enter Raffle** to join. The host clicks **Pick Winner** when ready.`,
    )
    .setColor(0x7289da)
    .setFooter({ text: `Provider: ${link.provider}` });

  const placeholderRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("raffle:join:_")
      .setLabel("Enter Raffle")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("raffle:end:_")
      .setLabel("Pick Winner")
      .setStyle(ButtonStyle.Success),
  );

  let raffleMsg: Message;
  raffleMsg = await channel.send({
    embeds: [embed],
    components: [placeholderRow],
  });

  await createRaffle(raffleMsg.id, channelId, guildId, link, authorId);

  const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`raffle:join:${raffleMsg.id}`)
      .setLabel("Enter Raffle")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`raffle:end:${raffleMsg.id}`)
      .setLabel("Pick Winner")
      .setStyle(ButtonStyle.Success),
  );
  await raffleMsg.edit({ components: [updatedRow] }).catch(() => undefined);
}
