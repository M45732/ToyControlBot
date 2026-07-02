import { EmbedBuilder, type Embed } from "discord.js";

import { detectControlLink } from "./control-link.service.js";
import type { ParsedControlLink } from "./control-link.types.js";

const BRAND_COLOR = 0x00ffff;

/**
 * Field names used to carry wizard state (link, anonymity choice, optional
 * message) between interaction steps on the bot's own message embed, plus
 * the sentinel written for "no message set". Defined once here — and only
 * read/written through `readWizardState`/the embed builders below — so the
 * two sides of the round-trip can't drift out of sync.
 */
const FIELD_LINK = "Link";
const FIELD_ANONYMOUS = "Anonymous";
const FIELD_MESSAGE = "Message";
const EMPTY_MESSAGE = "-";

export interface WizardState {
  readonly link: ParsedControlLink;
  readonly anonymous: boolean;
  /** Undefined when no message was set (never the literal empty-message sentinel). */
  readonly message: string | undefined;
}

function fieldValue(embed: Embed | null, name: string): string | undefined {
  return embed?.fields.find((field) => field.name === name)?.value;
}

/**
 * Read back whatever wizard state is present on a message's embed. Returns
 * null if there's no valid "Link" field to recover — the single place every
 * step checks that the wizard message it's operating on is still valid,
 * instead of each handler re-deriving the link/anonymous/message fields
 * itself.
 */
export function readWizardState(embed: Embed | null): WizardState | null {
  const url = fieldValue(embed, FIELD_LINK);
  const link = url ? detectControlLink(url) : null;
  if (!link) return null;

  const rawMessage = fieldValue(embed, FIELD_MESSAGE);
  return {
    link,
    anonymous: fieldValue(embed, FIELD_ANONYMOUS) === "yes",
    message: rawMessage && rawMessage !== EMPTY_MESSAGE ? rawMessage : undefined,
  };
}

export function buildLinkDetectedEmbed(link: ParsedControlLink, guildName: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Control Link Detected")
    .setDescription(
      `This looks like a **${link.provider}** control link.\n\nClick **Start** to raffle it off in **${guildName}**.`,
    )
    .setColor(BRAND_COLOR)
    .addFields({ name: FIELD_LINK, value: link.url });
}

export function buildAnonymousChoiceEmbed(link: ParsedControlLink): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("Stay anonymous?")
    .setDescription(
      "The raffle post can show your name, or stay anonymous. Please select:",
    )
    .setColor(BRAND_COLOR)
    .addFields({ name: FIELD_LINK, value: link.url });
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
      { name: FIELD_LINK, value: link.url },
      { name: FIELD_ANONYMOUS, value: anonymous ? "yes" : "no", inline: true },
      { name: FIELD_MESSAGE, value: message || EMPTY_MESSAGE, inline: true },
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
