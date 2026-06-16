import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";
import {
  buildDailyEmbed,
  buildPatronButtonRow,
  buildToplistButtonRow,
  buildToplistEmbed,
} from "./economy.embeds.js";
import {
  isPatron,
  isServerBooster,
  isVerified,
} from "./economy.permissions.js";
import {
  claimDaily,
  getBalance,
  getHistory,
  getRank,
  getToplistPage,
} from "./economy.service.js";

const dailyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Get your daily free token"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = await requireGuildMember(interaction);

    if (!isVerified(member)) {
      throw new UserFacingError(
        "You are not verified! Please verify to get free daily tokens + bonus tokens.",
      );
    }

    await interaction.deferReply();

    const result = await claimDaily(interaction.guildId!, interaction.user.id, {
      isBooster: isServerBooster(member),
      isPatron: isPatron(member),
      eventId: interaction.id,
    });

    const embed = buildDailyEmbed(result);
    await interaction.editReply({
      embeds: [embed],
      components: result.claimed ? [buildPatronButtonRow()] : [],
    });
  },
};

const tokenBalanceCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("token-balance")
    .setDescription("Check your current token balance or your token history")
    .addStringOption((option) =>
      option
        .setName("view")
        .setDescription("Show your current balance or your recent history")
        .setRequired(false)
        .addChoices(
          { name: "current", value: "current" },
          { name: "history", value: "history" },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const view = interaction.options.getString("view") ?? "current";

    if (view === "history") {
      const history = await getHistory(
        interaction.guildId!,
        interaction.user.id,
      );
      const lines = history.length
        ? history.map(
            (entry) =>
              `${entry.amount >= 0 ? "+" : ""}${entry.amount} token — ${entry.eventType} (<t:${Math.floor(entry.createdAt.getTime() / 1000)}:R>)`,
          )
        : ["No token history yet."];
      await interaction.reply({ content: lines.join("\n"), ephemeral: true });
      return;
    }

    const balance = await getBalance(interaction.guildId!, interaction.user.id);
    await interaction.reply({
      content: `Your account has ${balance} token`,
      ephemeral: true,
    });
  },
};

const tokenToplistCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("token-toplist")
    .setDescription("Show the token leaderboard")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Show the toplist position of the mentioned user")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    await interaction.deferReply();

    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const guildId = interaction.guildId!;

    const rank = await getRank(guildId, targetUser.id);
    const description = rank
      ? `<@${targetUser.id}> is #${rank} in the toplist`
      : `<@${targetUser.id}> has no token yet.`;

    const { entries, page, totalPages } = await getToplistPage(guildId, 1);

    await interaction.editReply({
      embeds: [buildToplistEmbed(entries, page, totalPages, description)],
      components: [buildToplistButtonRow(page, totalPages, targetUser.id)],
    });
  },
};

export const economyCommands: SlashCommand[] = [
  dailyCommand,
  tokenBalanceCommand,
  tokenToplistCommand,
];
