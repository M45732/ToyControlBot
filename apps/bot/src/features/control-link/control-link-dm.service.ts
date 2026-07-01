import {
  BaseGuildTextChannel,
  EmbedBuilder,
  type Client,
  type Guild,
} from "discord.js";

import { config } from "../../config/index.js";
import type { ParsedControlLink } from "./control-link.types.js";

const BRAND_COLOR = 0x00ffff;

export interface DmRaffleTarget {
  readonly channel: BaseGuildTextChannel;
  readonly guild: Guild;
}

/**
 * Resolve where a DM-submitted control link should be raffled off: the same
 * channel already configured for in-guild control-link posting.
 *
 * Returns null if `CHAN_ID_TOY_LINK` isn't configured, or the channel can't
 * be resolved (deleted, bot kicked, etc.) — the DM flow is disabled in that
 * case rather than guessing a guild.
 */
export async function resolveDmRaffleTarget(client: Client): Promise<DmRaffleTarget | null> {
  const { allowedChannelId } = config.controlLink;
  if (!allowedChannelId) return null;

  const channel = await client.channels.fetch(allowedChannelId).catch(() => null);
  if (!channel || !(channel instanceof BaseGuildTextChannel)) return null;

  return { channel, guild: channel.guild };
}

/**
 * Read back the link URL carried in the "Link" field of the wizard embed
 * attached to the bot's own DM message, so each step doesn't need external
 * state storage.
 */
export function readLinkFromEmbed(embed: { fields: { name: string; value: string }[] } | null): string | null {
  return embed?.fields.find((field) => field.name === "Link")?.value ?? null;
}

export function buildLinkDetectedEmbed(link: ParsedControlLink, guildName: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Control Link Detected")
    .setDescription(
      `This looks like a **${link.provider}** control link.\n\nClick **Start** to raffle it off in **${guildName}**.`,
    )
    .setColor(BRAND_COLOR)
    .addFields({ name: "Link", value: link.url });
}

export function buildAnonymousChoiceEmbed(link: ParsedControlLink): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Stay anonymous?")
    .setDescription(
      "The raffle post can show your name, or stay anonymous. Please select:",
    )
    .setColor(BRAND_COLOR)
    .addFields({ name: "Link", value: link.url });
}

export function buildMessageStepEmbed(
  link: ParsedControlLink,
  anonymous: boolean,
  message: string,
): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle('Add a message? (optional, e.g. "Low vibes only")')
    .setDescription("Click **Start Raffle** when you're ready to post it.")
    .setColor(BRAND_COLOR)
    .addFields(
      { name: "Link", value: link.url },
      { name: "Anonymous", value: anonymous ? "yes" : "no", inline: true },
      { name: "Message", value: message || "-", inline: true },
    );
}

export function buildSentEmbed(channelId: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Sent!")
    .setDescription(`Your link was posted to <#${channelId}>.`)
    .setColor(BRAND_COLOR);
}

export function buildUnsupportedLinkEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Hey there 👋")
    .setDescription(
      "Send me a supported toy control link (Lovense, Handyfeeling, or xtoys) and I'll raffle it off for you.",
    )
    .setColor(BRAND_COLOR);
}
