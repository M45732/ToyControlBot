import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";
import { getConnectedToys } from "./lovense.service.js";
import { startSession } from "./session.service.js";
import type { SessionMode } from "./session.types.js";

const toySessionCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("toy-session")
    .setDescription("Start a reaction-vote toy control session")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(
          "gangbang = you get controlled by everyone | orgy = others can join too",
        )
        .setRequired(true)
        .addChoices(
          { name: "gangbang (you get controlled)", value: "gangbang" },
          { name: "orgy (group — others can join)", value: "orgy" },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const mode = interaction.options.getString("mode", true) as SessionMode;

    await interaction.deferReply({ ephemeral: true });

    const toyStatus = await getConnectedToys(interaction.user.id);
    if (toyStatus.state === "app-offline") {
      throw new UserFacingError(
        "Your Lovense app is offline. Start the app, connect your toy, then try again.",
      );
    }
    if (toyStatus.state === "no-toys") {
      throw new UserFacingError(
        "No toy is connected to your Lovense app. Connect a toy then try again.",
      );
    }

    const messageId = await startSession(
      interaction.client,
      interaction.guildId!,
      interaction.channelId,
      interaction.user.id,
      mode,
    );

    await interaction.editReply({
      content: `Session started! https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${messageId}`,
    });
  },
};

export const sessionCommands: SlashCommand[] = [toySessionCommand];
