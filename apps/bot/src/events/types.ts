import type { ClientEvents } from "discord.js";

/**
 * A typed Discord event handler.
 *
 * `once` controls whether the handler is registered with `client.once` (fired a
 * single time, e.g. `ready`) or `client.on` (fired on every occurrence).
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  readonly name: K;
  readonly once?: boolean;
  execute(...args: ClientEvents[K]): void | Promise<void>;
}

/**
 * Helper to define an event with full type inference on `execute` arguments.
 */
export function defineEvent<K extends keyof ClientEvents>(event: BotEvent<K>): BotEvent<K> {
  return event;
}
