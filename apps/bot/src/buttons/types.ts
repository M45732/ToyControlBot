import type { ButtonInteraction } from "discord.js";

/**
 * The contract every button handler module must satisfy.
 *
 * `matches` decides whether a handler owns a given `customId`; the first
 * matching handler in the registry wins.
 */
export interface ButtonHandler {
  matches(customId: string): boolean;
  execute(interaction: ButtonInteraction): Promise<void>;
}
