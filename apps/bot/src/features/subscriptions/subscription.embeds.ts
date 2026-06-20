import { EmbedBuilder } from "discord.js";

import type { PerformerStats, SubscriptionView } from "./subscription.types.js";

const BRAND_COLOR = 0x02e3f3;

function unix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * The member-facing "my subscriptions" embed (the legacy `/subscriptions` view).
 */
export function buildSubscriptionsEmbed(
  subs: SubscriptionView[],
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("Your Subscriptions")
    .setColor(BRAND_COLOR)
    .setTimestamp();

  if (subs.length === 0) {
    embed.setDescription(
      "You have no active subscriptions. Use `/subscribe` to join a performer's fanclub.",
    );
    return embed;
  }

  for (const sub of subs) {
    embed.addFields({
      name: sub.planName,
      value: [
        `Performer: <@${sub.performerId}>`,
        `Price: **${sub.priceTokens}** tokens / 30 days`,
        `Renews: <t:${unix(sub.expiresAt)}:D> (<t:${unix(sub.expiresAt)}:R>)`,
        `Auto-renew: ${sub.autoRenew ? "✅ on" : "❌ off"}`,
        `Fanclub: <#${sub.threadId}>`,
      ].join("\n"),
    });
  }

  return embed;
}

/**
 * The performer-facing stats embed (the legacy "Active Subscriber" panel).
 */
export function buildPerformerStatsEmbed(stats: PerformerStats): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`Subscription Stats — ${stats.planName}`)
    .setColor(BRAND_COLOR)
    .setTimestamp()
    .addFields(
      {
        name: "Active subscribers",
        value: `${stats.activeSubscribers}`,
        inline: true,
      },
      {
        name: "Projected income",
        value: `${stats.projectedIncome} tokens / 30 days`,
        inline: true,
      },
      { name: "​", value: "​", inline: false },
      {
        name: "All-time subscribers",
        value: `${stats.allTimeSubscribers}`,
        inline: true,
      },
      {
        name: "Lifetime earned",
        value: `${stats.lifetimeEarned} tokens`,
        inline: true,
      },
      {
        name: "Price",
        value: `${stats.priceTokens} tokens / 30 days`,
        inline: true,
      },
    );
}
