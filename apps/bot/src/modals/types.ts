import type { ModalSubmitInteraction } from "discord.js";

/**
 * The contract every modal handler module must satisfy.
 *
 * `matches` decides whether a handler owns a given `customId`; the first
 * matching handler in the registry wins.
 */
export interface ModalHandler {
  matches(customId: string): boolean;
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}
