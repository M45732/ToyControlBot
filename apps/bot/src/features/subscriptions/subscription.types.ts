/**
 * The fixed length of one subscription period, in milliseconds (30 days).
 *
 * Kept as a constant (mirroring the daily-token cooldown) rather than config:
 * pricing is per-plan, but the billing cadence is a product-wide rule.
 */
export const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

export type SubscriptionStatus = "active" | "expired";

export interface SubscribeResult {
  readonly planName: string;
  readonly performerId: string;
  readonly priceTokens: number;
  readonly expiresAt: Date;
  readonly subscriberNewBalance: number;
  /** True when this extended an existing (lapsed) subscription rather than creating a new one. */
  readonly renewed: boolean;
}

export interface SubscriptionView {
  readonly planId: string;
  readonly performerId: string;
  readonly planName: string;
  readonly priceTokens: number;
  readonly threadId: string;
  readonly status: SubscriptionStatus;
  readonly autoRenew: boolean;
  readonly expiresAt: Date;
}

export interface PerformerStats {
  readonly planName: string;
  readonly priceTokens: number;
  readonly activeSubscribers: number;
  /** Tokens the performer earns per period if every active subscriber renews. */
  readonly projectedIncome: number;
  /** Distinct members who have ever subscribed to this plan. */
  readonly allTimeSubscribers: number;
  /** Total tokens earned from this plan to date, from the token ledger. */
  readonly lifetimeEarned: number;
}
