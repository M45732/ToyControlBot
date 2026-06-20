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
    const rawMessage = interaction.options.getString("message") ?? undefined;
    // Cap before committing so the public announcement never exceeds Discord's limit.
    const tipMessage = rawMessage && rawMessage.length > 200
      ? `${rawMessage.slice(0, 197)}...`
      : rawMessage;

    // Defer ephemerally so any error (e.g. insufficient balance) stays private.
    await interaction.deferReply({ ephemeral: true });

    const result = await executeTip(
      interaction.guildId!,
      interaction.channelId,
      interaction.user.id,
      amount,
      tipMessage,
    );

    // Private confirmation showing the sender's updated balance.
    await interaction.editReply({
      content: `Tip sent! Your new balance: **${result.senderNewBalance}** tokens.`,
    });

    // Public announcement — only the actual receivers may be mentioned so a
    // user-supplied tipMessage cannot ping @everyone or arbitrary roles/users.
    const receiversText = result.receiverIds.map((id) => `<@${id}>`).join(", ");
    const lines = [
      `**${interaction.user.displayName}** tipped **${result.amount}** tokens to ${receiversText}! 💝`,
      tipMessage ? `> ${tipMessage}` : null,
    ].filter(Boolean);

    await interaction.followUp({
      content: lines.join("\n"),
      ephemeral: false,
      allowedMentions: { users: result.receiverIds },
    });
  },
};

export const tippingCommands: SlashCommand[] = [tipCommand];
