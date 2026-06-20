import type { Client } from "discord.js";
import { Prisma } from "@prisma/client";
import type { Subscription, SubscriptionPlan } from "@prisma/client";

import { prisma } from "../../services/database.service.js";
import { UserFacingError } from "../../lib/errors.js";
import { createLogger } from "../../lib/logger.js";
import {
  addToThread,
  fetchThreadOrThrow,
  isThreadMember,
  removeFromThread,
  resolveThread,
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

/**
 * Thrown inside the subscribe transaction when the member ends up with valid
 * access via a concurrent path (a renewal sweep or another subscribe won the
 * race). Signals the outer handler to roll back our charge but *keep* the
 * member in the thread, rather than revoking access as it would on a real
 * failure.
 */
class KeepAccessError extends UserFacingError {}

function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function activeSubscriberMoveError(): UserFacingError {
  return new UserFacingError(
    "You can't move your fanclub to a different thread while you have active subscriber(s) — they'd lose access. You can still update the name, price, or description.",
  );
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
  const movingThread = existing != null && existing.threadId !== threadId;

  // Moving the plan to a different thread would strand current subscribers:
  // they'd keep (stale) access to the old thread and have none in the new one.
  // Disallow it while anyone is actively subscribed rather than silently
  // migrating memberships. The count + write run in one transaction and the
  // count is re-checked after the write, so a subscription created concurrently
  // with the move is caught (the move aborts) instead of stranding the member.
  await prisma.$transaction(async (tx) => {
    // Count *all* non-lapsed subscriptions, including ones whose period has
    // ended but the hourly sweep hasn't lapsed yet — those members may still be
    // in the old thread, so a move would strand them too.
    const countActive = (): Promise<number> =>
      tx.subscription.count({
        where: { planId: existing!.id, status: "active" },
      });

    if (movingThread && (await countActive()) > 0) {
      throw activeSubscriberMoveError();
    }

    await tx.subscriptionPlan.upsert({
      where: { guildId_performerId: { guildId, performerId } },
      update: { name, description, priceTokens, threadId, active: true },
      create: {
        guildId,
        performerId,
        name,
        description,
        priceTokens,
        threadId,
      },
    });

    if (movingThread && (await countActive()) > 0) {
      // A member subscribed during the move — roll back so the performer retries
      // rather than leaving the new subscriber stranded in the old thread.
      throw activeSubscriberMoveError();
    }
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

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SUBSCRIPTION_PERIOD_MS);

    // Reject up front if they already have live access. The per-user lock above
    // means no concurrent subscribe can change this between here and the charge.
    const existing = await prisma.subscription.findUnique({
      where: { planId_subscriberId: { planId: plan.id, subscriberId } },
    });
    if (existing && existing.status === "active" && existing.expiresAt > now) {
      throw new UserFacingError(
        `You're already subscribed — your access runs until <t:${toUnix(existing.expiresAt)}:D>.`,
      );
    }

    // Grant access *before* taking any tokens, so a member can never be charged
    // for a fanclub they couldn't be added to. If the add fails (e.g. the bot
    // lacks permission on the private thread) we abort without charging.
    const thread = await fetchThreadOrThrow(client, plan.threadId);
    // Note whether they were already a member so a later rollback only revokes
    // access we actually granted (not a manual invite or stale membership).
    const wasAlreadyMember = await isThreadMember(thread, subscriberId);
    const added = await addToThread(thread, subscriberId);
    if (!added) {
      throw new UserFacingError(
        "Couldn't add you to the fanclub thread — the bot may be missing access there. You were not charged.",
      );
    }

    let result: SubscribeResult;
    try {
      result = await prisma.$transaction(async (tx) => {
        const freshPlan = await tx.subscriptionPlan.findUnique({
          where: { id: plan.id },
        });
        if (!freshPlan || !freshPlan.active) {
          throw new UserFacingError(
            "This performer hasn't set up a subscription yet.",
          );
        }
        // The performer may have moved the plan to a different thread between
        // our addToThread() above and now. We only granted access to the thread
        // we read earlier, so refuse to charge for a different one — the outer
        // catch revokes the access we did grant.
        if (freshPlan.threadId !== plan.threadId) {
          throw new UserFacingError(
            "This fanclub was just reconfigured. Please try again.",
          );
        }

        // Re-read the subscription row *inside* the transaction. The upfront
        // check used a stale read; a renewal sweep may have renewed this row in
        // the window since (e.g. while we awaited addToThread).
        const current = await tx.subscription.findUnique({
          where: {
            planId_subscriberId: { planId: freshPlan.id, subscriberId },
          },
        });
        if (current && current.status === "active" && current.expiresAt > now) {
          // Already live — the sweep (or another path) renewed it. Keep access.
          throw new KeepAccessError(
            `You're already subscribed — your access runs until <t:${toUnix(current.expiresAt)}:D>.`,
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

        // Claim the subscription as ours for this period. A renewal sweep racing
        // us changes the row's (status, expiresAt), so its conditional claim and
        // ours are mutually exclusive — only one charges. If we lose, throwing
        // rolls back the debit above and keeps the member's access (the winner
        // activated them).
        if (current) {
          const claim = await tx.subscription.updateMany({
            where: {
              id: current.id,
              status: current.status,
              expiresAt: current.expiresAt,
            },
            data: {
              status: "active",
              autoRenew: true,
              expiresAt,
              lastChargedAt: now,
            },
          });
          if (claim.count === 0) {
            throw new KeepAccessError(
              "Your subscription was just updated elsewhere — you're all set.",
            );
          }
        } else {
          try {
            await tx.subscription.create({
              data: {
                planId: freshPlan.id,
                subscriberId,
                status: "active",
                autoRenew: true,
                expiresAt,
                lastChargedAt: now,
              },
            });
          } catch (err) {
            if (
              err instanceof Prisma.PrismaClientKnownRequestError &&
              err.code === "P2002"
            ) {
              throw new KeepAccessError(
                "Your subscription was just created elsewhere — you're all set.",
              );
            }
            throw err;
          }
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

        const balanceRow = await tx.tokenBalance.findUnique({
          where: { guildId_userId: { guildId, userId: subscriberId } },
        });

        return {
          planName: freshPlan.name,
          performerId,
          priceTokens: freshPlan.priceTokens,
          expiresAt,
          subscriberNewBalance: balanceRow?.balance ?? 0,
          renewed: current !== null,
        } satisfies SubscribeResult;
      });
    } catch (err) {
      // A concurrent renewal/subscribe already gave them valid access — roll
      // back our charge (already done by the throw) but leave them in the thread.
      if (err instanceof KeepAccessError) {
        throw err;
      }
      // Any other failure (insufficient balance, plan moved, unexpected) means
      // they have no live access, so revoke the thread membership — but only if
      // we were the ones who added them, never a pre-existing/manual membership.
      if (!wasAlreadyMember) {
        await removeFromThread(client, plan.threadId, subscriberId);
      }
      throw err;
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
      // Resolve the fanclub thread, distinguishing a deleted thread (lapse) from
      // a transient outage (skip and retry next sweep — never charge or lapse on
      // a blip).
      const resolution = await resolveThread(client, sub.plan.threadId);
      if (resolution.state === "gone") {
        await lapse(client, sub);
        continue;
      }
      if (resolution.state === "unreachable") {
        continue;
      }
      const outcome = await chargeRenewal(sub, now);
      if (outcome === "insufficient") {
        await lapse(client, sub);
      } else if (outcome === "charged") {
        // Ensure the paid member is actually in the thread — a moderator may
        // have removed them during the previous period. Idempotent re-add.
        await addToThread(resolution.thread, sub.subscriberId);
      }
      // "claimed-elsewhere": another processor handled it; nothing to do.
    } catch (err) {
      log.error(
        { err, subscriptionId: sub.id },
        "Renewal failed; will retry next sweep",
      );
    }
  }
}

type SubscriptionWithPlan = Subscription & { plan: SubscriptionPlan };

type RenewalOutcome = "charged" | "insufficient" | "claimed-elsewhere";

/** A concurrent processor already renewed this period; abort without charging. */
class AlreadyClaimedError extends Error {}
/** The subscriber can't afford the renewal; the caller should lapse. */
class InsufficientBalanceError extends Error {}

/**
 * Attempt one auto-renew charge.
 *
 * The due period is *claimed* first via a conditional update on the row's
 * current `expiresAt`, before any token movement. If a concurrent sweep (or a
 * manual re-subscribe) already advanced the period, our claim matches zero rows
 * and we bail without charging — so the same period can never be billed twice,
 * and we never lapse a subscription another processor just paid.
 */
async function chargeRenewal(
  sub: SubscriptionWithPlan,
  now: Date,
): Promise<RenewalOutcome> {
  const { plan } = sub;
  // Extend from the later of "now" and the old expiry so a backlog of missed
  // sweeps doesn't shorten a paid period.
  const base = Math.max(sub.expiresAt.getTime(), now.getTime());
  const newExpiry = new Date(base + SUBSCRIPTION_PERIOD_MS);

  try {
    await prisma.$transaction(async (tx) => {
      // Claim the period: only the processor that still sees the expiry we read
      // wins. This also rolls back (reverting the expiry) if the debit below
      // fails, so an insufficient balance never leaves a half-renewed row.
      // `autoRenew: true` is part of the claim so a /subscription-cancel that
      // lands after the sweep loaded this row still wins — we won't charge a
      // subscription that was cancelled in the meantime.
      const claim = await tx.subscription.updateMany({
        where: {
          id: sub.id,
          status: "active",
          expiresAt: sub.expiresAt,
          autoRenew: true,
        },
        data: { expiresAt: newExpiry, lastChargedAt: now },
      });
      if (claim.count === 0) {
        throw new AlreadyClaimedError();
      }

      const debit = await tx.tokenBalance.updateMany({
        where: {
          guildId: plan.guildId,
          userId: sub.subscriberId,
          balance: { gte: plan.priceTokens },
        },
        data: { balance: { decrement: plan.priceTokens } },
      });
      if (debit.count === 0) {
        throw new InsufficientBalanceError();
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
    });
    return "charged";
  } catch (err) {
    if (err instanceof AlreadyClaimedError) {
      return "claimed-elsewhere";
    }
    if (err instanceof InsufficientBalanceError) {
      return "insufficient";
    }
    throw err;
  }
}

async function lapse(client: Client, sub: SubscriptionWithPlan): Promise<void> {
  // Conditionally claim the lapse against the exact stale row we selected. If a
  // renewal or /subscribe advanced (status, expiresAt) since, this matches zero
  // rows and we leave the freshly-paid subscription untouched — no wrongful
  // expire, no thread removal.
  const claimed = await prisma.subscription.updateMany({
    where: { id: sub.id, status: "active", expiresAt: sub.expiresAt },
    data: { status: "expired" },
  });
  if (claimed.count === 0) {
    return;
  }

  const removed = await removeFromThread(
    client,
    sub.plan.threadId,
    sub.subscriberId,
  );
  if (!removed) {
    // Couldn't revoke access (transient). Revert to active+due so the next sweep
    // retries — but only if a /subscribe didn't renew it in the meantime (its
    // claim would have set a future expiresAt, which this condition won't match).
    await prisma.subscription.updateMany({
      where: { id: sub.id, status: "expired", expiresAt: sub.expiresAt },
      data: { status: "active" },
    });
    log.warn(
      { subscriptionId: sub.id },
      "Deferring lapse — thread removal failed; reverted to retry next sweep",
    );
    return;
  }

  // We expired then revoked. If a /subscribe renewed this row (expired → active)
  // in the window before our removal landed, restore the access we just took —
  // they've paid through a future date.
  const after = await prisma.subscription.findUnique({
    where: { id: sub.id },
    select: { status: true, expiresAt: true },
  });
  if (after && after.status === "active" && after.expiresAt > new Date()) {
    const resolution = await resolveThread(client, sub.plan.threadId);
    if (resolution.state === "ok") {
      await addToThread(resolution.thread, sub.subscriberId);
    }
    log.info(
      { subscriptionId: sub.id },
      "Lapse raced a renewal — re-added member to thread",
    );
    return;
  }

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
