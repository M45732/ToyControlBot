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
import { prisma } from "../../services/database.service.js";
import { sendVibrate } from "../lovense/lovense.client.js";

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
    if (!ownerId) {
      throw new UserFacingError(
        "This command requires OWNER_DISCORD_ID to be configured. Contact the server administrator.",
      );
    }
    if (interaction.user.id !== ownerId) {
      throw new UserFacingError("Only the bot owner can use this command.");
    }

    await interaction.deferReply({ ephemeral: true });

    // Stop all active toys before exiting so participants are not left
    // vibrating at the last voted level if the process manager is slow.
    const activeSessions = await prisma.toyControl.findMany({
      where: { active: true },
      include: { participants: true },
    });
    for (const session of activeSessions) {
      for (const { userId } of session.participants) {
        await sendVibrate(userId, 0).catch(() => undefined);
      }
    }

    await interaction.editReply({ content: "Restarting..." });
    // Exit 0 so the process manager (PM2, systemd) restarts the bot
    process.exit(0);
  },
};

export const ownerCommands: SlashCommand[] = [versionCommand, restartCommand];
