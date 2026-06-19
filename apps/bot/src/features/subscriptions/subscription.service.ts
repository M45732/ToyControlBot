import type { Client } from "discord.js";
import type { Prisma, Subscription, SubscriptionPlan } from "@prisma/client";

import { prisma } from "../../services/database.service.js";
import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";
import {
  addToThread,
  fetchThreadOrThrow,
  removeFromThread,
} from "./subscription.threads.js";
import {
  SUBSCRIPTION_PERIOD_MS,
  type PerformerStats,
  type SubscribeResult,
  type SubscriptionStatus,
  type SubscriptionView,
} from "./subscription.types.js";

const log = createLogger("subscriptions");

// Token-ledger event types used by the subscription feature.
const EVENT_PAID = "subscription_paid"; // first-time subscriber debit
const EVENT_RENEWAL = "subscription_renewal"; // auto-renew subscriber debit
const EVENT_INCOME = "subscription_income"; // performer credit (both cases)

/**
 * In-flight subscribe attempts, keyed by guild+performer+subscriber. Guards
 * against a double-click charging a member twice before the first transaction
 * commits. Safe because the has()+add() pair runs without an await between
 * them, so it is atomic within Node's single-threaded event loop (same pattern
 * as the session service).
 */
const pendingSubscribes = new Set<string>();

function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Create or update a performer's subscription plan (their "fanclub").
 *
 * @returns whether a new plan was created (vs. an existing one updated).
 */
export async function upsertPlan(
  guildId: string,
  performerId: string,
  name: string,
  description: string | undefined,
  priceTokens: number,
  threadId: string,
): Promise<{ created: boolean }> {
  // threadId is globally unique; make sure it isn't already gated by a
  // different performer's plan before we try to (re)point this one at it.
  const byThread = await prisma.subscriptionPlan.findUnique({
    where: { threadId },
  });
  if (byThread && byThread.performerId !== performerId) {
    throw new UserFacingError(
      "That thread is already used for another performer's subscription.",
    );
  }

  const existing = await prisma.subscriptionPlan.findUnique({
    where: { guildId_performerId: { guildId, performerId } },
  });

  await prisma.subscriptionPlan.upsert({
    where: { guildId_performerId: { guildId, performerId } },
    update: { name, description, priceTokens, threadId, active: true },
    create: { guildId, performerId, name, description, priceTokens, threadId },
  });

  return { created: existing === null };
}

/**
 * Get a performer's active plan, or null if they have none.
 */
export function getActivePlanByPerformer(
  guildId: string,
  performerId: string,
): Promise<SubscriptionPlan | null> {
  return prisma.subscriptionPlan.findFirst({
    where: { guildId, performerId, active: true },
  });
}

/**
 * Subscribe a member to a performer's plan: validate the thread, atomically
 * charge the subscriber and credit the performer, persist the subscription,
 * then add the member to the fanclub thread.
 *
 * The token moves mirror the tip flow — a conditional debit on
 * `balance >= price` means a concurrent charge can never push a balance
 * negative.
 */
export async function subscribe(
  client: Client,
  guildId: string,
  performerId: string,
  subscriberId: string,
): Promise<SubscribeResult> {
  if (performerId === subscriberId) {
    throw new UserFacingError("You can't subscribe to your own fanclub.");
  }

  const lockKey = `${guildId}:${performerId}:${subscriberId}`;
  if (pendingSubscribes.has(lockKey)) {
    throw new UserFacingError(
      "A subscription is already being processed. Please wait a moment.",
    );
  }
  pendingSubscribes.add(lockKey);

  try {
    const plan = await getActivePlanByPerformer(guildId, performerId);
    if (!plan) {
      throw new UserFacingError(
        "This performer hasn't set up a subscription yet.",
      );
    }

    // Confirm the thread is reachable before taking any tokens, so we never
    // charge for access we can't grant.
    const thread = await fetchThreadOrThrow(client, plan.threadId);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SUBSCRIPTION_PERIOD_MS);

    const result = await prisma.$transaction(async (tx) => {
      const freshPlan = await tx.subscriptionPlan.findUnique({
        where: { id: plan.id },
      });
      if (!freshPlan || !freshPlan.active) {
        throw new UserFacingError(
          "This performer hasn't set up a subscription yet.",
        );
      }

      const existing = await tx.subscription.findUnique({
        where: { planId_subscriberId: { planId: freshPlan.id, subscriberId } },
      });
      if (
        existing &&
        existing.status === "active" &&
        existing.expiresAt > now
      ) {
        throw new UserFacingError(
          `You're already subscribed — your access runs until <t:${toUnix(existing.expiresAt)}:D>.`,
        );
      }

      const debit = await tx.tokenBalance.updateMany({
        where: {
          guildId,
          userId: subscriberId,
          balance: { gte: freshPlan.priceTokens },
        },
        data: { balance: { decrement: freshPlan.priceTokens } },
      });
      if (debit.count === 0) {
        const row = await tx.tokenBalance.findUnique({
          where: { guildId_userId: { guildId, userId: subscriberId } },
        });
        throw new UserFacingError(
          `You need ${freshPlan.priceTokens} tokens to subscribe. Your balance is ${row?.balance ?? 0}.`,
        );
      }
      await tx.tokenHistory.create({
        data: {
          guildId,
          userId: subscriberId,
          amount: -freshPlan.priceTokens,
          eventType: EVENT_PAID,
          eventId: freshPlan.id,
        },
      });

      await creditPerformer(
        tx,
        guildId,
        performerId,
        freshPlan.priceTokens,
        freshPlan.id,
      );

      await tx.subscription.upsert({
        where: { planId_subscriberId: { planId: freshPlan.id, subscriberId } },
        update: {
          status: "active",
          autoRenew: true,
          expiresAt,
          lastChargedAt: now,
        },
        create: {
          planId: freshPlan.id,
          subscriberId,
          status: "active",
          autoRenew: true,
          expiresAt,
          lastChargedAt: now,
        },
      });

      const balanceRow = await tx.tokenBalance.findUnique({
        where: { guildId_userId: { guildId, userId: subscriberId } },
      });

      return {
        planName: freshPlan.name,
        performerId,
        priceTokens: freshPlan.priceTokens,
        expiresAt,
        subscriberNewBalance: balanceRow?.balance ?? 0,
        renewed: existing !== null,
      } satisfies SubscribeResult;
    });

    // Side-effect after the charge commits. Best-effort: a failure is logged,
    // not thrown, so the performer keeps the (earned) tokens.
    const added = await addToThread(thread, subscriberId);
    if (!added) {
      log.warn(
        { guildId, performerId, subscriberId },
        "Subscribed but thread add failed",
      );
    }

    return result;
  } finally {
    pendingSubscribes.delete(lockKey);
  }
}

async function creditPerformer(
  tx: Prisma.TransactionClient,
  guildId: string,
  performerId: string,
  amount: number,
  planId: string,
): Promise<void> {
  await tx.tokenBalance.upsert({
    where: { guildId_userId: { guildId, userId: performerId } },
    update: { balance: { increment: amount } },
    create: { guildId, userId: performerId, balance: amount },
  });
  await tx.tokenHistory.create({
    data: {
      guildId,
      userId: performerId,
      amount,
      eventType: EVENT_INCOME,
      eventId: planId,
    },
  });
}

/**
 * List a member's active subscriptions in a guild, soonest to expire first.
 */
export async function listSubscriptionsForUser(
  guildId: string,
  subscriberId: string,
): Promise<SubscriptionView[]> {
  const subs = await prisma.subscription.findMany({
    where: { subscriberId, status: "active", plan: { guildId } },
    include: { plan: true },
    orderBy: { expiresAt: "asc" },
  });
  return subs.map(toView);
}

/**
 * Toggle auto-renew on a member's active subscription to a performer.
 * Returns the updated view, or null if they have no active subscription.
 */
export async function setAutoRenew(
  guildId: string,
  performerId: string,
  subscriberId: string,
  enabled: boolean,
): Promise<SubscriptionView | null> {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { guildId, performerId },
  });
  if (!plan) {
    return null;
  }
  const sub = await prisma.subscription.findUnique({
    where: { planId_subscriberId: { planId: plan.id, subscriberId } },
  });
  if (!sub || sub.status !== "active") {
    return null;
  }
  await prisma.subscription.update({
    where: { id: sub.id },
    data: { autoRenew: enabled },
  });
  return toView({ ...sub, autoRenew: enabled, plan });
}

/**
 * Income / subscriber stats for a performer's active plan, or null if none.
 */
export async function getPerformerStats(
  guildId: string,
  performerId: string,
): Promise<PerformerStats | null> {
  const plan = await getActivePlanByPerformer(guildId, performerId);
  if (!plan) {
    return null;
  }
  const now = new Date();
  const [activeSubscribers, allTimeSubscribers, earned] = await Promise.all([
    prisma.subscription.count({
      where: { planId: plan.id, status: "active", expiresAt: { gt: now } },
    }),
    prisma.subscription.count({ where: { planId: plan.id } }),
    prisma.tokenHistory.aggregate({
      where: { guildId, userId: performerId, eventType: EVENT_INCOME },
      _sum: { amount: true },
    }),
  ]);

  return {
    planName: plan.name,
    priceTokens: plan.priceTokens,
    activeSubscribers,
    projectedIncome: activeSubscribers * plan.priceTokens,
    allTimeSubscribers,
    lifetimeEarned: earned._sum.amount ?? 0,
  };
}

/**
 * The renewal sweep: for every subscription whose paid period has ended,
 * either re-charge it (auto-renew on, plan active, sufficient balance) or let
 * it lapse and revoke thread access. Transient errors are logged and left for
 * the next sweep so access is never wrongly revoked.
 */
export async function renewDueSubscriptions(client: Client): Promise<void> {
  const now = new Date();
  const due = await prisma.subscription.findMany({
    where: { status: "active", expiresAt: { lte: now } },
    include: { plan: true },
  });
  if (due.length === 0) {
    return;
  }
  log.info({ count: due.length }, "Processing due subscriptions");

  for (const sub of due) {
    try {
      if (!sub.autoRenew || !sub.plan.active) {
        await lapse(client, sub);
        continue;
      }
      const charged = await chargeRenewal(sub, now);
      if (!charged) {
        await lapse(client, sub);
      }
    } catch (err) {
      log.error(
        { err, subscriptionId: sub.id },
        "Renewal failed; will retry next sweep",
      );
    }
  }
}

type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan };

/**
 * Attempt one auto-renew charge. Returns false (without writing) when the
 * subscriber can't afford the price, so the caller can lapse the subscription.
 */
async function chargeRenewal(
  sub: SubscriptionWithPlan,
  now: Date,
): Promise<boolean> {
  const { plan } = sub;
  // Extend from the later of "now" and the old expiry so a backlog of missed
  // sweeps doesn't shorten a paid period.
  const base = Math.max(sub.expiresAt.getTime(), now.getTime());
  const newExpiry = new Date(base + SUBSCRIPTION_PERIOD_MS);

  return prisma.$transaction(async (tx) => {
    const debit = await tx.tokenBalance.updateMany({
      where: {
        guildId: plan.guildId,
        userId: sub.subscriberId,
        balance: { gte: plan.priceTokens },
      },
      data: { balance: { decrement: plan.priceTokens } },
    });
    if (debit.count === 0) {
      return false;
    }
    await tx.tokenHistory.create({
      data: {
        guildId: plan.guildId,
        userId: sub.subscriberId,
        amount: -plan.priceTokens,
        eventType: EVENT_RENEWAL,
        eventId: plan.id,
      },
    });
    await creditPerformer(
      tx,
      plan.guildId,
      plan.performerId,
      plan.priceTokens,
      plan.id,
    );
    await tx.subscription.update({
      where: { id: sub.id },
      data: { expiresAt: newExpiry, lastChargedAt: now },
    });
    return true;
  });
}

async function lapse(client: Client, sub: SubscriptionWithPlan): Promise<void> {
  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "expired" },
  });
  await removeFromThread(client, sub.plan.threadId, sub.subscriberId);
  log.info({ subscriptionId: sub.id }, "Subscription lapsed");
}

function toView(sub: SubscriptionWithPlan): SubscriptionView {
  return {
    planId: sub.planId,
    performerId: sub.plan.performerId,
    planName: sub.plan.name,
    priceTokens: sub.plan.priceTokens,
    threadId: sub.plan.threadId,
    status: sub.status as SubscriptionStatus,
    autoRenew: sub.autoRenew,
    expiresAt: sub.expiresAt,
  };
}
