import {
  Events,
  type Message,
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

const log = createLogger("messageCreate");

export const messageCreateEvent = defineEvent({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (!message.guildId || message.author.bot) return;

    const link = detectControlLink(message.content);
    if (!link) return;

    const { allowedChannelId } = config.controlLink;

    if (allowedChannelId && message.channelId !== allowedChannelId) {
      await message.delete().catch(() => undefined);
      await message.author
        .send(
          `Your control link was removed from <#${message.channelId}>. Control links are only allowed in <#${allowedChannelId}>.`,
        )
        .catch(() => undefined);
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle("Control Link Raffle")
      .setDescription(
        `<@${message.author.id}> shared a **${link.provider}** control link!\n\nClick **Enter Raffle** to join. The host clicks **Pick Winner** when ready.`,
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
      raffleMsg = await message.reply({ embeds: [embed], components: [placeholderRow] });
    } catch (err) {
      log.error({ err }, "Failed to send raffle message");
      return;
    }

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
