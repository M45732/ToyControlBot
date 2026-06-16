import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { requireGuildMember } from "../../services/permission.service.js";
import { buildPairingEmbed, buildToyStatusEmbed } from "./lovense.embeds.js";
import { getConnectedToys, requestPairingQr } from "./lovense.service.js";

const toyConnectCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("toy-connect")
    .setDescription("Get a QR code to pair your toy with this bot"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    await interaction.deferReply({ ephemeral: true });

    const qr = await requestPairingQr(interaction.user.id);
    await interaction.editReply({ embeds: [buildPairingEmbed(qr)] });
  },
};

const toyStatusCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("toy-status")
    .setDescription("Check which toys are currently connected"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    await interaction.deferReply({ ephemeral: true });

    const status = await getConnectedToys(interaction.user.id);
    await interaction.editReply({ embeds: [buildToyStatusEmbed(status)] });
  },
};

export const lovenseCommands: SlashCommand[] = [
  toyConnectCommand,
  toyStatusCommand,
];
