import {
  EmbedBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";

const pingCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = interaction.client.ws.ping;
    await interaction.editReply(
      `Pong! Round-trip: **${roundtrip}ms** | WebSocket: **${wsLatency}ms**`,
    );
  },
};

const helpCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all available commands"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const { commands } = await import("../../commands/index.js");

    const embed = new EmbedBuilder()
      .setTitle("Available Commands")
      .setColor(0x5865f2)
      .setDescription(
        commands.map((cmd) => `**/${cmd.data.name}**`).join("\n"),
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export const utilityCommands: SlashCommand[] = [pingCommand, helpCommand];
