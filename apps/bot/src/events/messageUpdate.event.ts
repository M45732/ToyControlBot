import {
  BaseGuildTextChannel,
  Events,
  type Message,
  type PartialMessage,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";
import {
  createRaffle,
  detectControlLink,
} from "../features/control-link/control-link.service.js";
import { defineEvent } from "./types.js";

const log = createLogger("messageUpdate");

export const messageUpdateEvent = defineEvent({
  name: Events.MessageUpdate,
  async execute(_old: Message | PartialMessage, newMessage: Message | PartialMessage): Promise<void> {
    // Fetch the full message if partial so we can read content.
    const message = newMessage.partial ? await newMessage.fetch().catch(() => null) : newMessage;
    if (!message) return;
    if (!message.guildId || message.author?.bot) return;

    const link = detectControlLink(message.content ?? "");
    if (!link) return;

    const { allowedChannelId } = config.controlLink;

    if (allowedChannelId && message.channelId !== allowedChannelId) {
      let deleted = false;
      await message.delete()
        .then(() => { deleted = true; })
        .catch((err: unknown) =>
          log.warn({ err, channelId: message.channelId }, "Failed to delete edited control-link message"),
        );

      if (!deleted) return;

      await message.author
        ?.send(
          `Your edited message was removed from <#${message.channelId}>. Control links are only allowed in <#${allowedChannelId}>.`,
        )
        .catch(() => undefined);
      return;
    }

    if (!(message.channel instanceof BaseGuildTextChannel)) return;

    let deleted = false;
    await message.delete().then(() => { deleted = true; }).catch((err: unknown) =>
      log.warn({ err }, "Failed to delete edited control-link message for raffle"),
    );

    if (!deleted) {
      await message.author
        ?.send(
          `Your edited message couldn't be raffled because the bot couldn't delete it in <#${message.channelId}>. ` +
          "Please make sure the bot has the **Manage Messages** permission in that channel.",
        )
        .catch(() => undefined);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Control Link Raffle")
      .setDescription(
        `<@${message.author?.id}> shared a **${link.provider}** control link!\n\nClick **Enter Raffle** to join. The host clicks **Pick Winner** when ready.`,
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
    try {
      raffleMsg = await message.channel.send({ embeds: [embed], components: [placeholderRow] });
    } catch (err) {
      log.error({ err }, "Failed to send raffle message for edited message");
      return;
    }

    if (!message.author) return;
    createRaffle(raffleMsg.id, message.channelId, link, message.author.id);

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
  },
});
