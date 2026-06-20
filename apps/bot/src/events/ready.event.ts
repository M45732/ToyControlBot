import { Events } from "discord.js";

import { createLogger } from "../lib/logger.js";
import { restoreActiveSessions } from "../features/lovense/session.service.js";
import { startRenewalScheduler } from "../features/subscriptions/subscription.scheduler.js";
import { defineEvent } from "./types.js";

const log = createLogger("ready");

/**
 * Fired once when the bot has connected and is ready to receive events.
 */
export const readyEvent = defineEvent({
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    log.info(
      {
        user: client.user.tag,
        userId: client.user.id,
        guilds: client.guilds.cache.size,
      },
      "Bot is online and ready",
    );

    await restoreActiveSessions(client).catch((err: unknown) =>
      log.error({ err }, "Failed to restore active sessions"),
    );

    startRenewalScheduler(client);
  },
});
