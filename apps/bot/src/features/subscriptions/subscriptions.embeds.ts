import { EmbedBuilder } from "discord.js";

import type { BuyResult, SubscriptionData, SubscriptionPlanData } from "./subscriptions.types.js";

const BRAND_COLOR = 0x0099ff;

export function buildPlansEmbed(plans: SubscriptionPlanData[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Subscription Plans")
    .setColor(BRAND_COLOR)
    .setTimestamp();

  if (plans.length === 0) {
    embed.setDescription("No subscription plans are currently available.");
    return embed;
  }

  // Discord's hard embed limit is 6000 characters total. Stay under it even
  // when plans have long names (max 100) and descriptions (max 300).
  const EMBED_CHAR_BUDGET = 5800;
  const MAX_FIELDS = 25;
  let charCount = 0;
  let shown = 0;

  for (const plan of plans) {
    if (shown >= MAX_FIELDS) break;

    const lines: string[] = [
      `**Cost:** ${plan.tokenCost} token`,
      `**Duration:** ${plan.durationDays} day${plan.durationDays !== 1 ? "s" : ""}`,
    ];
    if (plan.renewalTokenCost !== null) {
      lines.push(`**Renewal cost:** ${plan.renewalTokenCost} token`);
    }
    if (plan.roleId) {
      lines.push(`**Role granted:** <@&${plan.roleId}>`);
    }
    if (plan.description) {
      lines.push(plan.description);
    }
    const value = lines.join("\n");
    const fieldChars = plan.name.length + value.length;
    if (charCount + fieldChars > EMBED_CHAR_BUDGET) break;

    embed.addFields({ name: plan.name, value, inline: false });
    charCount += fieldChars;
    shown++;
  }

  const overflow = plans.length - shown;
  if (overflow > 0) {
    embed.setFooter({ text: `${overflow} more plan${overflow !== 1 ? "s" : ""} not shown` });
  }

  return embed;
}

export function buildSubscriptionsEmbed(
  subs: SubscriptionData[],
  activeSubs: SubscriptionData[],
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Your Subscriptions")
    .setColor(BRAND_COLOR)
    .setTimestamp();

  if (subs.length === 0) {
    embed.setDescription("You have no subscriptions.");
    return embed;
  }

  const MAX_FIELDS = 25;
  const displayed = subs.slice(0, MAX_FIELDS);
  const overflow = subs.length - displayed.length;
  const activeIds = new Set(activeSubs.map((s) => s.id));

  for (const sub of displayed) {
    const isActive = activeIds.has(sub.id);
    const status = sub.cancelledAt
      ? "Expired"
      : isActive
        ? "Active"
        : "Expired";
    const validUntilTs = Math.floor(sub.validUntil.getTime() / 1000);
    const lines = [
      `**Status:** ${status}`,
      `**Valid until:** <t:${validUntilTs}:D>`,
      `**Auto-renew:** ${sub.autoRenew ? "Yes" : "No"}`,
    ];
    embed.addFields({ name: sub.planName, value: lines.join("\n"), inline: false });
  }

  if (overflow > 0) {
    embed.setFooter({ text: `${overflow} more entr${overflow !== 1 ? "ies" : "y"} not shown` });
  }

  return embed;
}

export function buildBuySuccessEmbed(result: BuyResult): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Subscription Purchased")
    .setColor(BRAND_COLOR)
    .setTimestamp();

  const sub = result.subscription!;
  const validUntilTs = Math.floor(sub.validUntil.getTime() / 1000);
  embed.setDescription(
    [
      `You are now subscribed to **${sub.planName}**.`,
      `**Tokens spent:** ${result.tokensSpent}`,
      `**Valid until:** <t:${validUntilTs}:D>`,
      `**Auto-renew:** ${sub.autoRenew ? "Yes" : "No"}`,
    ].join("\n"),
  );

  return embed;
}
