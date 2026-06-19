import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  ThreadChannel,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";
import {
  buildPerformerStatsEmbed,
  buildSubscriptionsEmbed,
} from "./subscription.embeds.js";
import {
  getPerformerStats,
  listSubscriptionsForUser,
  setAutoRenew,
  subscribe,
  upsertPlan,
} from "./subscription.service.js";

const SUBSCRIBABLE_THREAD_TYPES = [
  ChannelType.PrivateThread,
  ChannelType.PublicThread,
] as const;

const subscribeCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscribe")
    .setDescription("Subscribe to a performer's fanclub with tokens")
    .addUserOption((option) =>
      option
        .setName("performer")
        .setDescription("The performer whose fanclub you want to join")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    const performer = interaction.options.getUser("performer", true);

    await interaction.deferReply({ ephemeral: true });

    const result = await subscribe(
      interaction.client,
      interaction.guildId!,
      performer.id,
      interaction.user.id,
    );

    const verb = result.renewed ? "renewed" : "started";
    await interaction.editReply({
      content: [
        `Subscription ${verb}! You joined **${result.planName}** for **${result.priceTokens}** tokens.`,
        `Access runs until <t:${Math.floor(result.expiresAt.getTime() / 1000)}:D> and auto-renews.`,
        `Your new balance: **${result.subscriberNewBalance}** tokens.`,
        `Turn off renewal any time with \`/subscription-cancel\`.`,
      ].join("\n"),
    });
  },
};

const subscriptionsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscriptions")
    .setDescription("View your active subscriptions"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const subs = await listSubscriptionsForUser(
      interaction.guildId!,
      interaction.user.id,
    );
    await interaction.reply({
      embeds: [buildSubscriptionsEmbed(subs)],
      ephemeral: true,
    });
  },
};

const cancelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-cancel")
    .setDescription(
      "Stop a subscription from auto-renewing (keeps access until it expires)",
    )
    .addUserOption((option) =>
      option
        .setName("performer")
        .setDescription("The performer whose subscription to stop renewing")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    const performer = interaction.options.getUser("performer", true);

    const updated = await setAutoRenew(
      interaction.guildId!,
      performer.id,
      interaction.user.id,
      false,
    );
    if (!updated) {
      throw new UserFacingError(
        "You don't have an active subscription to that performer.",
      );
    }

    await interaction.reply({
      content: `Auto-renew turned off. You keep access to **${updated.planName}** until <t:${Math.floor(updated.expiresAt.getTime() / 1000)}:D>, then it won't renew.`,
      ephemeral: true,
    });
  },
};

const setupCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-setup")
    .setDescription("Set up or update your fanclub subscription")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription('The name members see, e.g. "Amon\'s Fanclub"')
        .setRequired(true)
        .setMaxLength(100),
    )
    .addIntegerOption((option) =>
      option
        .setName("price")
        .setDescription("Monthly price in tokens")
        .setRequired(true)
        .setMinValue(1),
    )
    .addChannelOption((option) =>
      option
        .setName("thread")
        .setDescription(
          "The private thread subscribers get added to (defaults to this thread)",
        )
        .addChannelTypes(...SUBSCRIBABLE_THREAD_TYPES)
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("What subscribers get")
        .setRequired(false)
        .setMaxLength(500),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = await requireGuildMember(interaction);

    const name = interaction.options.getString("name", true);
    const price = interaction.options.getInteger("price", true);
    const description =
      interaction.options.getString("description") ?? undefined;
    const threadOption = interaction.options.getChannel("thread");

    // Resolve the target thread: the explicit option, else the current channel.
    const target = threadOption ?? interaction.channel;
    const thread = await interaction.client.channels
      .fetch(target?.id ?? "")
      .catch(() => null);
    if (!(thread instanceof ThreadChannel)) {
      throw new UserFacingError(
        "Run this inside the thread you want to gate, or pass a thread with the `thread` option.",
      );
    }

    // Only the thread's owner (or a moderator) may put a paywall on it.
    const isOwner = thread.ownerId === interaction.user.id;
    const isModerator = member.permissions.has(
      PermissionFlagsBits.ManageThreads,
    );
    if (!isOwner && !isModerator) {
      throw new UserFacingError(
        "You can only set up a subscription on a thread you created.",
      );
    }

    if (thread.type === ChannelType.PublicThread) {
      // A public thread isn't actually gated, so warn but allow it.
      await interaction.deferReply({ ephemeral: true });
    }

    const { created } = await upsertPlan(
      interaction.guildId!,
      interaction.user.id,
      name,
      description,
      price,
      thread.id,
    );

    const note =
      thread.type === ChannelType.PublicThread
        ? "\n⚠️ This is a **public** thread — anyone with channel access can already see it. Use a **private** thread to actually gate access."
        : "";
    const content = `Your fanclub **${name}** is ${created ? "set up" : "updated"} at <#${thread.id}> for **${price}** tokens / 30 days. Members can join with \`/subscribe performer:@you\`.${note}`;

    if (interaction.deferred) {
      await interaction.editReply({ content });
    } else {
      await interaction.reply({ content, ephemeral: true });
    }
  },
};

const statsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-stats")
    .setDescription("View your fanclub's subscriber and income stats"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);

    const stats = await getPerformerStats(
      interaction.guildId!,
      interaction.user.id,
    );
    if (!stats) {
      throw new UserFacingError(
        "You haven't set up a subscription yet. Use `/subscription-setup` first.",
      );
    }

    await interaction.reply({
      embeds: [buildPerformerStatsEmbed(stats)],
      ephemeral: true,
    });
  },
};

export const subscriptionCommands: SlashCommand[] = [
  subscribeCommand,
  subscriptionsCommand,
  cancelCommand,
  setupCommand,
  statsCommand,
];
