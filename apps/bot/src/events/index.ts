import type { Client } from "discord.js";

import { createLogger } from "../lib/logger.js";
import { interactionCreateEvent } from "./interactionCreate.event.js";
import { readyEvent } from "./ready.event.js";
import type { BotEvent } from "./types.js";

const log = createLogger("events");

/**
 * Every event handler the bot should register.
 *
 * Add new handlers here as features are migrated.
 */
const events: BotEvent[] = [readyEvent, interactionCreateEvent];

/**
 * Wire all registered event handlers onto the Discord client.
 */
export function registerEvents(client: Client): void {
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  log.info({ count: events.length }, "Registered event handlers");
}
