import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type APIEmbedField,
} from "discord.js";

import type { DailyClaimResult, ToplistEntry } from "./economy.types.js";

const BRAND_COLOR = 0x0099ff;

export function buildDailyEmbed(result: DailyClaimResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Daily token")
    .setColor(BRAND_COLOR)
    .setTimestamp();

  if (!result.claimed) {
    const minutes = Math.ceil((result.msUntilNextClaim ?? 0) / 60000);
    embed.setDescription(
      `You already received your daily token! Next redeem in ${formatMinutes(minutes)}.`,
    );
    return embed;
  }

  const fields: APIEmbedField[] = [
    {
      name: "Server Booster",
      value: result.boosterBonus
        ? "✅ +100 token bonus"
        : "❌ Boost for an additional +100 token",
      inline: true,
    },
    {
      name: "Patron",
      value: result.patronBonus
        ? "✅ +100 token bonus"
        : "❌ Patrons get an additional +100 token",
      inline: true,
    },
    { name: "Total", value: `${result.tokensAwarded} token`, inline: false },
  ];

  embed
    .setDescription(
      "You received your daily token, plus any bonuses listed below:",
    )
    .addFields(fields);

  return embed;
}

export function buildPatronButtonRow(): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setLabel("Become a Patron")
      .setStyle(ButtonStyle.Link)
      .setURL("https://www.patreon.com/vibemytoy"),
  );
}

export function buildToplistEmbed(
  entries: ToplistEntry[],
  page: number,
  totalPages: number,
  requesterDescription: string,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Token Toplist")
    .setColor(BRAND_COLOR)
    .setDescription(requesterDescription)
    .setFooter({ text: `Page ${page} of ${totalPages}` });

  for (const entry of entries) {
    embed.addFields({
      name: `#${entry.rank}`,
      value: `${entry.balance} token | <@${entry.userId}>`,
    });
  }

  if (entries.length === 0) {
    embed.addFields({
      name: "No entries",
      value: "Nobody has any tokens yet.",
    });
  }

  return embed;
}

export function buildToplistButtonRow(
  page: number,
  totalPages: number,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("economy:toplist:1")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏮")
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`economy:toplist:${page - 1}`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏪")
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`economy:toplist:${page + 1}`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏩")
      .setDisabled(page >= totalPages),
    new ButtonBuilder()
      .setCustomId(`economy:toplist:${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("⏭")
      .setDisabled(page >= totalPages),
  );
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}
