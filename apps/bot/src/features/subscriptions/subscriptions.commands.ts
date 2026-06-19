import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";

import type { SlashCommand } from "../../commands/index.js";
import { UserFacingError } from "../../lib/errors.js";
import { requireGuildMember } from "../../services/permission.service.js";
import {
  buildBuySuccessEmbed,
  buildPlansEmbed,
  buildSubscriptionsEmbed,
} from "./subscriptions.embeds.js";
import {
  buySubscription,
  cancelAutoRenew,
  createPlan,
  getActivePlans,
  getUserSubscriptions,
  grantSubscriptionRole,
  processExpiredSubscriptions,
} from "./subscriptions.service.js";

const subscriptionsCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscriptions")
    .setDescription("View your subscriptions")
    .addStringOption((option) =>
      option
        .setName("view")
        .setDescription("Which subscriptions to show")
        .setRequired(false)
        .addChoices(
          { name: "active", value: "active" },
          { name: "history", value: "history" },
        ),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = await requireGuildMember(interaction);
    const guildId = interaction.guildId!;
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    await processExpiredSubscriptions(guildId, userId, member.guild);

    const allSubs = await getUserSubscriptions(guildId, userId);
    const now = new Date();
    const activeSubs = allSubs.filter(
      (s) => s.validUntil > now && !s.cancelledAt,
    );

    const view = interaction.options.getString("view") ?? "active";
    const displayed = view === "history" ? allSubs : activeSubs;

    await interaction.editReply({
      embeds: [buildSubscriptionsEmbed(displayed, activeSubs)],
    });
  },
};

const subscriptionPlansCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-plans")
    .setDescription("List available subscription plans in this server"),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    const guildId = interaction.guildId!;

    await interaction.deferReply();

    const plans = await getActivePlans(guildId);
    await interaction.editReply({ embeds: [buildPlansEmbed(plans)] });
  },
};

const subscriptionBuyCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-buy")
    .setDescription("Purchase a subscription plan")
    .addStringOption((option) =>
      option
        .setName("plan_name")
        .setDescription("The name of the plan to purchase")
        .setRequired(true),
    )
    .addBooleanOption((option) =>
      option
        .setName("auto_renew")
        .setDescription("Automatically renew when the subscription expires")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = await requireGuildMember(interaction);
    const guildId = interaction.guildId!;
    const userId = interaction.user.id;

    await interaction.deferReply({ ephemeral: true });

    await processExpiredSubscriptions(guildId, userId, member.guild);

    const planName = interaction.options.getString("plan_name", true);
    const autoRenew = interaction.options.getBoolean("auto_renew") ?? false;

    const result = await buySubscription(guildId, userId, planName, autoRenew);

    if (!result.success) {
      const messages: Record<string, string> = {
        plan_not_found: `No active plan named **${planName}** was found. Use \`/subscription-plans\` to see available plans.`,
        already_active: `You already have an active subscription to **${planName}**.`,
        insufficient_tokens: "You do not have enough tokens to purchase this plan.",
      };
      throw new UserFacingError(
        messages[result.reason ?? ""] ?? "Could not purchase the subscription.",
      );
    }

    if (result.subscription?.planId) {
      const plans = await getActivePlans(guildId);
      const plan = plans.find((p) => p.id === result.subscription!.planId);
      if (plan?.roleId) {
        await grantSubscriptionRole(member.guild, userId, plan.roleId);
      }
    }

    await interaction.editReply({ embeds: [buildBuySuccessEmbed(result)] });
  },
};

const subscriptionCancelCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-cancel")
    .setDescription("Cancel auto-renewal for a subscription")
    .addStringOption((option) =>
      option
        .setName("plan_name")
        .setDescription("The name of the plan to cancel auto-renewal for")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = await requireGuildMember(interaction);
    const guildId = interaction.guildId!;
    const userId = interaction.user.id;

    const planName = interaction.options.getString("plan_name", true);

    const cancelled = await cancelAutoRenew(guildId, userId, planName, member.guild);

    if (!cancelled) {
      throw new UserFacingError(
        `No active subscription with auto-renewal found for **${planName}**.`,
      );
    }

    await interaction.reply({
      content: `Auto-renewal has been disabled for **${planName}**. Your subscription will remain active until it expires.`,
      ephemeral: true,
    });
  },
};

const subscriptionCreateCommand: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("subscription-create")
    .setDescription("Create a subscription plan (admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The plan name")
        .setRequired(true)
        .setMaxLength(100),
    )
    .addIntegerOption((option) =>
      option
        .setName("token_cost")
        .setDescription("Tokens required to purchase")
        .setRequired(true)
        .setMinValue(1),
    )
    .addIntegerOption((option) =>
      option
        .setName("duration_days")
        .setDescription("How many days the subscription lasts")
        .setRequired(true)
        .setMinValue(1),
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("A short description of the plan")
        .setRequired(false)
        .setMaxLength(300),
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Discord role to grant to subscribers")
        .setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("renewal_cost")
        .setDescription("Token cost on renewal (defaults to token_cost if omitted)")
        .setRequired(false)
        .setMinValue(1),
    ),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await requireGuildMember(interaction);
    const guildId = interaction.guildId!;

    const name = interaction.options.getString("name", true);
    const tokenCost = interaction.options.getInteger("token_cost", true);
    const durationDays = interaction.options.getInteger("duration_days", true);
    const description = interaction.options.getString("description") ?? undefined;
    const role = interaction.options.getRole("role");
    const renewalCost = interaction.options.getInteger("renewal_cost") ?? undefined;

    if (role) {
      const botMember = await interaction.guild!.members.fetchMe();
      if (role.position >= botMember.roles.highest.position) {
        throw new UserFacingError(
          `I cannot manage the role **${role.name}** because it is at or above my highest role. Please choose a role below my top role.`,
        );
      }
    }

    await interaction.deferReply({ ephemeral: true });

    const plan = await createPlan(guildId, {
      name,
      tokenCost,
      durationDays,
      description,
      roleId: role?.id,
      renewalTokenCost: renewalCost,
    });

    await interaction.editReply({
      content: `Subscription plan **${plan.name}** created successfully. Members can purchase it with \`/subscription-buy plan_name:${plan.name}\`.`,
    });
  },
};

export const subscriptionCommands: SlashCommand[] = [
  subscriptionsCommand,
  subscriptionPlansCommand,
  subscriptionBuyCommand,
  subscriptionCancelCommand,
  subscriptionCreateCommand,
];
