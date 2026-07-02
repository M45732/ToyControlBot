import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type Message } from "discord.js";

import { createLogger } from "../../lib/logger.js";
import { detectControlLink, resolveRaffleChannel } from "./control-link.service.js";
import { buildLinkDetectedEmbed, buildUnsupportedLinkEmbed } from "./control-link-dm.service.js";

const log = createLogger("control-link-dm");

/**
 * Handle a DM sent to the bot: if it contains a supported control link, start
 * the raffle wizard; otherwise point the sender at what's supported.
 *
 * Mirrors the legacy `handlers/dmMessage.js` intake step, minus the
 * public/verified channel choice (there's only one configured control-link
 * channel in the new bot).
 */
export async function handleDirectMessage(message: Message): Promise<void> {
  const link = detectControlLink(message.content);
  if (!link) {
    await message.reply({ embeds: [buildUnsupportedLinkEmbed()] }).catch((err: unknown) =>
      log.warn({ err }, "Failed to reply to unsupported DM"),
    );
    return;
  }

  const target = await resolveRaffleChannel(message.client);
  if (!target) {
    await message
      .reply("Sorry, this bot isn't set up to raffle control links right now.")
      .catch(() => undefined);
    return;
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("control-link-raffle:start")
      .setLabel("Start")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("✅"),
  );

  await message
    .reply({ embeds: [buildLinkDetectedEmbed(link, target.guild.name)], components: [row] })
    .catch((err: unknown) => log.warn({ err }, "Failed to reply to DM control link"));
}
