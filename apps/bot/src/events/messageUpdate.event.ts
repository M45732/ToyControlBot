import {
  BaseGuildTextChannel,
  Events,
  type Message,
  type PartialMessage,
  ThreadChannel,
} from "discord.js";

import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";
import {
  detectControlLink,
  postRaffleEmbed,
} from "../features/control-link/control-link.service.js";
import { defineEvent } from "./types.js";

const log = createLogger("messageUpdate");

export const messageUpdateEvent = defineEvent({
  name: Events.MessageUpdate,
  async execute(
    _old: Message | PartialMessage,
    newMessage: Message | PartialMessage,
  ): Promise<void> {
    // Fetch the full message if partial so we can read content.
    const message = newMessage.partial
      ? await newMessage.fetch().catch(() => null)
      : newMessage;
    if (!message) return;
    // Guard author early — before any delete or send — so we never post an
    // unreachable raffle embed if author is absent on a fetched message.
    if (!message.guildId || !message.author || message.author.bot) return;

    const link = detectControlLink(message.content ?? "");
    if (!link) return;

    const { allowedChannelId } = config.controlLink;

    const isInAllowedChannel =
      message.channelId === allowedChannelId ||
      (message.channel instanceof ThreadChannel &&
        message.channel.parentId === allowedChannelId);

    if (allowedChannelId && !isInAllowedChannel) {
      let deleted = false;
      await message
        .delete()
        .then(() => {
          deleted = true;
        })
        .catch((err: unknown) =>
          log.warn(
            { err, channelId: message.channelId },
            "Failed to delete edited control-link message",
          ),
        );

      if (!deleted) return;

      await message.author
        .send(
          `Your edited message was removed from <#${message.channelId}>. Control links are only allowed in <#${allowedChannelId}>.`,
        )
        .catch(() => undefined);
      return;
    }

    if (
      !(message.channel instanceof BaseGuildTextChannel) &&
      !(message.channel instanceof ThreadChannel)
    )
      return;

    let deleted = false;
    await message
      .delete()
      .then(() => {
        deleted = true;
      })
      .catch((err: unknown) =>
        log.warn(
          { err },
          "Failed to delete edited control-link message for raffle",
        ),
      );

    if (!deleted) {
      await message.author
        .send(
          `Your edited message couldn't be raffled because the bot couldn't delete it in <#${message.channelId}>. ` +
            "Please make sure the bot has the **Manage Messages** permission in that channel.",
        )
        .catch(() => undefined);
      return;
    }

    try {
      await postRaffleEmbed(
        message.channel,
        message.author.id,
        message.guildId,
        message.channelId,
        link,
      );
    } catch (err) {
      log.error({ err }, "Failed to send raffle message for edited message");
    }
  },
});
