import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { requireGuildMember } from "../../services/permission.service.js";
import { executeTip } from "./tipping.service.js";

const tipCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("tip")
    .setDescription("Tip tokens to the active toy control session in this channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of tokens to tip")
        .setRequired(true)
        .setMinValue(1),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Optional message to show with your tip")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const amount = interaction.options.getInteger("amount", true);
    const tipMessage = interaction.options.getString("message") ?? undefined;

    await interaction.deferReply();

    const result = await executeTip(
      interaction.guildId!,
      interaction.channelId,
      interaction.user.id,
      amount,
      tipMessage,
    );

    const receiversText = result.receiverIds.map((id) => `<@${id}>`).join(", ");
    const lines = [
      `**${interaction.user.displayName}** tipped **${result.amount}** tokens to ${receiversText}! 💝`,
      tipMessage ? `> ${tipMessage}` : null,
      `Your new balance: **${result.senderNewBalance}** tokens`,
    ].filter(Boolean);

    await interaction.editReply({ content: lines.join("\n") });
  },
};

export const tippingCommands: SlashCommand[] = [tipCommand];
