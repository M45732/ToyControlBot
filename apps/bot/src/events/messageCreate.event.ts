import {
  BaseGuildTextChannel,
  Events,
  type Message,
  ThreadChannel,
} from "discord.js";

import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";
import { handleDirectMessage } from "../features/control-link/control-link-dm.message.js";
import {
  detectControlLink,
  postRaffleEmbed,
} from "../features/control-link/control-link.service.js";
import { defineEvent } from "./types.js";

const log = createLogger("messageCreate");

export const messageCreateEvent = defineEvent({
  name: Events.MessageCreate,
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    if (!message.guildId) {
      await handleDirectMessage(message).catch((err: unknown) =>
        log.error({ err }, "Failed to handle DM"),
      );
      return;
    }

    const link = detectControlLink(message.content);
    if (!link) return;

    const { allowedChannelId } = config.controlLink;

    // Accept the configured channel itself AND threads whose parent is that channel,
    // mirroring the legacy bot behaviour (legacy/old-bot-readonly/events/message/messageCreate.js:90-92).
    const isInAllowedChannel =
      message.channelId === allowedChannelId ||
      (message.channel instanceof ThreadChannel && message.channel.parentId === allowedChannelId);

    if (allowedChannelId && !isInAllowedChannel) {
      let deleted = false;
      await message.delete()
        .then(() => { deleted = true; })
        .catch((err: unknown) =>
          log.warn({ err, channelId: message.channelId }, "Failed to delete out-of-channel control-link message"),
        );

      if (!deleted) {
        // Link remains visible — do not mislead the author or silently fail
        return;
      }

      await message.author
        .send(
          `Your control link was removed from <#${message.channelId}>. Control links are only allowed in <#${allowedChannelId}>.`,
        )
        .catch(() => undefined);
      return;
    }

    if (!(message.channel instanceof BaseGuildTextChannel) && !(message.channel instanceof ThreadChannel)) return;

    // Delete the original message before posting the raffle so the URL is never
    // visible to non-winners. If we lack Manage Messages permission, abort: running
    // the raffle with the link still visible defeats the purpose.
    let deleted = false;
    await message.delete().then(() => { deleted = true; }).catch((err: unknown) =>
      log.warn({ err }, "Failed to delete original control-link message"),
    );

    if (!deleted) {
      await message.author
        .send(
          `Your control link couldn't be raffled because the bot couldn't delete your message in <#${message.channelId}>. ` +
          "Please make sure the bot has the **Manage Messages** permission in that channel.",
        )
        .catch(() => undefined);
      return;
    }

    try {
      await postRaffleEmbed(message.channel, message.author.id, message.guildId, message.channelId, link);
    } catch (err) {
      log.error({ err }, "Failed to send raffle message");
    }
  },
});
