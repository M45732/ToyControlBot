import {
  ActionRowBuilder,
  BaseGuildTextChannel,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";

const setupMemberDashboardCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-member-dashboard")
    .setDescription("Post the member token panel in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const embed = new EmbedBuilder()
      .setTitle("Member Dashboard")
      .setDescription("Manage your tokens below.")
      .setColor(0x5865f2)
      .addFields(
        { name: "Daily Tokens", value: "Claim free tokens every 24 hours." },
        { name: "Balance", value: "View your current token balance or history." },
        { name: "Leaderboard", value: "See who holds the most tokens." },
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("dashboard:daily")
        .setLabel("Claim Daily")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("dashboard:balance")
        .setLabel("My Balance")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("dashboard:toplist")
        .setLabel("Leaderboard")
        .setStyle(ButtonStyle.Secondary),
    );

    if (!(interaction.channel instanceof BaseGuildTextChannel)) {
      throw new UserFacingError("This command can only be used in a text channel.");
    }
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "Member dashboard posted.", ephemeral: true });
  },
};

const setupPerformerDashboardCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-performer-dashboard")
    .setDescription("Post the performer control panel in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const embed = new EmbedBuilder()
      .setTitle("Performer Dashboard")
      .setDescription("Start a toy session or connect your toy below.")
      .setColor(0xe91e63)
      .addFields(
        {
          name: "Toy Session",
          value: "Start a gangbang (you get controlled) or orgy (group) session.",
        },
        { name: "Tipping", value: "Members can tip you with `/tip` during an active session." },
        { name: "Connect Toy", value: "Pair your Lovense toy via QR code." },
        { name: "Subscriptions", value: "Run a paid fanclub with `/subscription-setup`." },
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("dashboard:start-gangbang")
        .setLabel("Start Gangbang")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("dashboard:start-orgy")
        .setLabel("Start Orgy")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("dashboard:connect-toy")
        .setLabel("Connect Toy")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("dashboard:subscriptions")
        .setLabel("Subscriptions")
        .setStyle(ButtonStyle.Secondary),
    );

    if (!(interaction.channel instanceof BaseGuildTextChannel)) {
      throw new UserFacingError("This command can only be used in a text channel.");
    }
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "Performer dashboard posted.", ephemeral: true });
  },
};

const setupToyControlDashboardCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("setup-toycontrol-dashboard")
    .setDescription("Post the toy-control dashboard in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const embed = new EmbedBuilder()
      .setTitle("Toy Control Hub")
      .setDescription("Start a control session in this server.")
      .setColor(0x02e3f3);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("dashboard:start-gangbang")
        .setLabel("Start Gangbang")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("dashboard:start-orgy")
        .setLabel("Start Orgy")
        .setStyle(ButtonStyle.Primary),
    );

    if (!(interaction.channel instanceof BaseGuildTextChannel)) {
      throw new UserFacingError("This command can only be used in a text channel.");
    }
    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: "Toy-control dashboard posted.", ephemeral: true });
  },
};

export const dashboardCommands: SlashCommand[] = [
  setupMemberDashboardCommand,
  setupPerformerDashboardCommand,
  setupToyControlDashboardCommand,
];
