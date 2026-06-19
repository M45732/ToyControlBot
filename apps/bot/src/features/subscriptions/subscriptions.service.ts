import type { Guild } from "discord.js";

import { prisma } from "../../services/database.service.js";
import type {
  BuyResult,
  RenewResult,
  SubscriptionData,
  SubscriptionPlanData,
} from "./subscriptions.types.js";

export interface CreatePlanOptions {
  readonly name: string;
  readonly description?: string;
  readonly tokenCost: number;
  readonly durationDays: number;
  readonly renewalTokenCost?: number;
  readonly roleId?: string;
}

export async function createPlan(
  guildId: string,
  opts: CreatePlanOptions,
): Promise<SubscriptionPlanData> {
  const plan = await prisma.subscriptionPlan.create({
    data: {
      guildId,
      name: opts.name,
      description: opts.description ?? null,
      tokenCost: opts.tokenCost,
      durationDays: opts.durationDays,
      renewalTokenCost: opts.renewalTokenCost ?? null,
      roleId: opts.roleId ?? null,
    },
  });
  return plan;
}

export async function getActivePlans(
  guildId: string,
): Promise<SubscriptionPlanData[]> {
  return prisma.subscriptionPlan.findMany({
    where: { guildId, active: true },
    orderBy: { tokenCost: "asc" },
  });
}

export async function getPlanByName(
  guildId: string,
  name: string,
): Promise<SubscriptionPlanData | null> {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { guildId_name: { guildId, name } },
  });
  return plan?.active ? plan : null;
}

function toSubscriptionData(
  sub: {
    id: string;
    userId: string;
    planId: string;
    autoRenew: boolean;
    roleGranted: boolean;
    validUntil: Date;
    cancelledAt: Date | null;
    createdAt: Date;
    plan: { name: string };
  },
): SubscriptionData {
  return {
    id: sub.id,
    userId: sub.userId,
    planId: sub.planId,
    planName: sub.plan.name,
    autoRenew: sub.autoRenew,
    roleGranted: sub.roleGranted,
    validUntil: sub.validUntil,
    cancelledAt: sub.cancelledAt,
    createdAt: sub.createdAt,
  };
}

export async function buySubscription(
  guildId: string,
  userId: string,
  planName: string,
  autoRenew: boolean,
): Promise<BuyResult> {
  const plan = await getPlanByName(guildId, planName);
  if (!plan) {
    return { success: false, reason: "plan_not_found" };
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findFirst({
      where: {
        guildId,
        userId,
        planId: plan.id,
        validUntil: { gt: now },
        cancelledAt: null,
      },
    });
    if (existing) {
      return { success: false, reason: "already_active" } as BuyResult;
    }

    const balanceRow = await tx.tokenBalance.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });
    if ((balanceRow?.balance ?? 0) < plan.tokenCost) {
      return { success: false, reason: "insufficient_tokens" } as BuyResult;
    }

    const validUntil = new Date(
      now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );
    const sub = await tx.subscription.create({
      data: { guildId, userId, planId: plan.id, autoRenew, validUntil },
      include: { plan: true },
    });

    await tx.tokenBalance.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: { balance: { decrement: plan.tokenCost } },
      create: { guildId, userId, balance: -plan.tokenCost },
    });
    await tx.tokenHistory.create({
      data: {
        guildId,
        userId,
        amount: -plan.tokenCost,
        eventType: "subscription_buy",
        eventId: sub.id,
      },
    });

    return {
      success: true,
      subscription: toSubscriptionData(sub),
      tokensSpent: plan.tokenCost,
    } as BuyResult;
  });
}

export async function cancelAutoRenew(
  guildId: string,
  userId: string,
  planName: string,
  guild: Guild,
): Promise<boolean> {
  const now = new Date();

  // No validUntil filter: also clears auto-renewal on expired-but-unprocessed rows.
  // Does not filter plan.active so subscribers to deactivated plans can still cancel.
  const disabled = await prisma.subscription.updateMany({
    where: {
      guildId,
      userId,
      cancelledAt: null,
      autoRenew: true,
      plan: { guildId, name: planName },
    },
    data: { autoRenew: false },
  });

  if (disabled.count === 0) return false;

  // Mark any already-expired rows cancelled and revoke the role if no other
  // active subscription still grants it.
  const expiredRows = await prisma.subscription.findMany({
    where: {
      guildId,
      userId,
      cancelledAt: null,
      validUntil: { lte: now },
      plan: { guildId, name: planName },
    },
    include: { plan: true },
  });

  for (const sub of expiredRows) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelledAt: now },
    });

    if (sub.roleGranted && sub.plan.roleId) {
      const otherActive = await prisma.subscription.findFirst({
        where: {
          guildId,
          userId,
          id: { not: sub.id },
          cancelledAt: null,
          validUntil: { gt: now },
          roleGranted: true,
          plan: { roleId: sub.plan.roleId },
        },
      });
      if (!otherActive) {
        try {
          const member = await guild.members.fetch(userId);
          await member.roles.remove(sub.plan.roleId);
        } catch {
          // Member may have left the guild; ignore role removal failure.
        }
      }
    }
  }

  return true;
}

export async function getUserSubscriptions(
  guildId: string,
  userId: string,
): Promise<SubscriptionData[]> {
  const subs = await prisma.subscription.findMany({
    where: { guildId, userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  return subs.map(toSubscriptionData);
}

export async function processExpiredSubscriptions(
  guildId: string,
  userId: string,
  guild: Guild,
): Promise<void> {
  const now = new Date();
  const expired = await prisma.subscription.findMany({
    where: {
      guildId,
      userId,
      validUntil: { lte: now },
      cancelledAt: null,
    },
    include: { plan: true },
  });

  // Pass 1: attempt all auto-renewals before any cancellations so a
  // successfully renewed sub is not mistakenly treated as expired in pass 2.
  const renewedIds = new Set<string>();
  for (const sub of expired) {
    if (!sub.autoRenew || !sub.plan.active) continue;

    const cost = sub.plan.renewalTokenCost ?? sub.plan.tokenCost;
    const newValidUntil = new Date(
      now.getTime() + sub.plan.durationDays * 24 * 60 * 60 * 1000,
    );

    const renewed = await prisma.$transaction(async (tx) => {
      // Atomic test-and-set: only extend if still expired, not cancelled, and
      // autoRenew is still true (guards against a concurrent /subscription-cancel).
      const claimed = await tx.subscription.updateMany({
        where: { id: sub.id, validUntil: { lte: now }, cancelledAt: null, autoRenew: true },
        data: { validUntil: newValidUntil },
      });
      if (claimed.count === 0) {
        return false;
      }
      // Conditional debit: scalar WHERE + balance >= cost is atomic so two
      // concurrent renewals for different subs cannot both drain the same wallet.
      const deducted = await tx.tokenBalance.updateMany({
        where: { guildId, userId, balance: { gte: cost } },
        data: { balance: { decrement: cost } },
      });
      if (deducted.count === 0) {
        // Insufficient balance; roll back the validUntil extension.
        await tx.subscription.update({
          where: { id: sub.id },
          data: { validUntil: sub.validUntil },
        });
        return false;
      }
      await tx.tokenHistory.create({
        data: {
          guildId,
          userId,
          amount: -cost,
          eventType: "subscription_renew",
          eventId: sub.id,
        },
      });
      return true;
    });

    if (renewed) {
      renewedIds.add(sub.id);
      // Re-grant the role in case it was revoked by an earlier cancellation
      // in a prior batch that processed before this renewal succeeded.
      if (sub.plan.roleId) {
        const granted = await grantSubscriptionRole(guild, userId, sub.plan.roleId);
        if (granted) {
          await markRoleGranted(sub.id);
        }
      }
    }
  }

  // Pass 2: cancel remaining expired subs now that all renewals are settled.
  for (const sub of expired) {
    if (renewedIds.has(sub.id)) continue;

    // Guard with validUntil: still expired so a concurrently renewed row is never cancelled.
    const cancelled = await prisma.subscription.updateMany({
      where: { id: sub.id, validUntil: { lte: now }, cancelledAt: null },
      data: { cancelledAt: now },
    });

    if (cancelled.count > 0 && sub.roleGranted && sub.plan.roleId) {
      const otherActive = await prisma.subscription.findFirst({
        where: {
          guildId,
          userId,
          id: { not: sub.id },
          cancelledAt: null,
          validUntil: { gt: now },
          roleGranted: true,
          plan: { roleId: sub.plan.roleId },
        },
      });
      if (!otherActive) {
        try {
          const member = await guild.members.fetch(userId);
          await member.roles.remove(sub.plan.roleId);
        } catch {
          // Member may have left the guild; ignore role removal failure.
        }
      }
    }
  }
}

/**
 * Grant a role to a member. Returns true only when the role was actually added
 * (i.e. the member did not already hold it), so callers can record whether this
 * subscription is responsible for the grant and should later remove the role.
 */
export async function grantSubscriptionRole(
  guild: Guild,
  userId: string,
  roleId: string,
): Promise<boolean> {
  try {
    const member = await guild.members.fetch(userId);
    if (member.roles.cache.has(roleId)) return false;
    await member.roles.add(roleId);
    return true;
  } catch {
    // Member may have left the guild; ignore role grant failure.
    return false;
  }
}

export async function markRoleGranted(subscriptionId: string): Promise<void> {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { roleGranted: true },
  });
}
