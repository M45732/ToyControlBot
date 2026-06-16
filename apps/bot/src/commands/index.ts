import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { economyCommands } from "../features/economy/economy.commands.js";

/**
 * The contract every slash command module must satisfy.
 *
 * Command handlers should stay thin: validate input, check interaction context,
 * delegate to a feature service, and reply. Business logic lives in services.
 */
export interface SlashCommand {
  readonly data: Pick<SlashCommandBuilder, "name" | "toJSON">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * The command registry.
 *
 * Commands are added here as features are migrated from the legacy bot. See
 * `docs/feature-map.md` for the migration roadmap.
 */
export const commands: SlashCommand[] = [...economyCommands];

/**
 * Look up a registered command by its slash-command name.
 */
export function findCommand(name: string): SlashCommand | undefined {
  return commands.find((command) => command.data.name === name);
}
