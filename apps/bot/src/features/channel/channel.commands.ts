import {
  GuildChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";

const blockMemberCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("channel-block")
    .setDescription("Block a member from viewing the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option.setName("member").setDescription("The member to block").setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const targetUser = interaction.options.getUser("member", true);
    const channel = interaction.channel;

    if (!channel || !(channel instanceof GuildChannel)) {
      throw new UserFacingError("Cannot manage permissions for this channel.");
    }

    const targetMember = await interaction.guild!.members
      .fetch(targetUser.id)
      .catch(() => null);
    if (!targetMember) {
      throw new UserFacingError("Member not found.");
    }

    await channel.permissionOverwrites.edit(targetMember, { ViewChannel: false });

    await interaction.reply({
      content: `<@${targetUser.id}> has been blocked from this channel.`,
      ephemeral: true,
    });
  },
};

const invitePerformerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("channel-invite-performer")
    .setDescription("Invite a performer to access the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option.setName("member").setDescription("The performer to invite").setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const targetUser = interaction.options.getUser("member", true);
    const channel = interaction.channel;

    if (!channel || !(channel instanceof GuildChannel)) {
      throw new UserFacingError("Cannot manage permissions for this channel.");
    }

    const targetMember = await interaction.guild!.members
      .fetch(targetUser.id)
      .catch(() => null);
    if (!targetMember) {
      throw new UserFacingError("Member not found.");
    }

    await channel.permissionOverwrites.edit(targetMember, {
      ViewChannel: true,
      SendMessages: true,
    });

    await interaction.reply({
      content: `<@${targetUser.id}> has been invited to this channel.`,
      ephemeral: true,
    });
  },
};

const removePerformerCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("channel-remove-performer")
    .setDescription("Remove a performer's access from the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption((option) =>
      option.setName("member").setDescription("The performer to remove").setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const targetUser = interaction.options.getUser("member", true);
    const channel = interaction.channel;

    if (!channel || !(channel instanceof GuildChannel)) {
      throw new UserFacingError("Cannot manage permissions for this channel.");
    }

    await channel.permissionOverwrites.delete(targetUser.id);

    await interaction.reply({
      content: `<@${targetUser.id}>'s channel access has been removed.`,
      ephemeral: true,
    });
  },
};

export const channelCommands: SlashCommand[] = [
  blockMemberCommand,
  invitePerformerCommand,
  removePerformerCommand,
];
