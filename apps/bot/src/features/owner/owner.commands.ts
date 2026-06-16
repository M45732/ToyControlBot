import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import { config } from "../../config/index.js";
import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";

function readPackageVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    ) as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

const versionCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("version")
    .setDescription("Show the bot version"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({ content: `Bot version: **${readPackageVersion()}**`, ephemeral: true });
  },
};

const restartCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Restart the bot process (owner only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const { ownerId } = config.owner;
    if (ownerId && interaction.user.id !== ownerId) {
      throw new UserFacingError("Only the bot owner can use this command.");
    }

    await interaction.reply({ content: "Restarting...", ephemeral: true });
    // Exit 0 so the process manager (PM2, systemd) restarts the bot
    process.exit(0);
  },
};

export const ownerCommands: SlashCommand[] = [versionCommand, restartCommand];
