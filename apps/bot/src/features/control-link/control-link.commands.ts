import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { requireGuildMember } from "../../services/permission.service.js";

/**
 * Starts the same raffle wizard as DMing the bot a link, but via a modal —
 * so the raw link is never shown in the channel's public "used /command"
 * line the way a plain string option would be.
 */
const controlLinkRaffleCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("control-link-raffle")
    .setDescription("Raffle off a toy control link without posting it publicly"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const input = new TextInputBuilder()
      .setCustomId("link-text")
      .setLabel("Paste your control link")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(500)
      .setRequired(true);

    const modal = new ModalBuilder()
      .setCustomId("control-link-raffle:link-modal")
      .setTitle("Raffle a control link")
      .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

    await interaction.showModal(modal);
  },
};

export const controlLinkCommands: SlashCommand[] = [controlLinkRaffleCommand];
