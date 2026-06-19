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
  return prisma.subscriptionPlan.findFirst({
    where: { guildId_name: { guildId, name }, active: true },
  });
}

function toSubscriptionData(
  sub: {
    id: string;
    userId: string;
    planId: string;
    autoRenew: boolean;
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
): Promise<boolean> {
  const plan = await getPlanByName(guildId, planName);
  if (!plan) {
    return false;
  }

  const now = new Date();
  const result = await prisma.subscription.updateMany({
    where: {
      guildId,
      userId,
      planId: plan.id,
      validUntil: { gt: now },
      cancelledAt: null,
      autoRenew: true,
    },
    data: { autoRenew: false },
  });

  return result.count > 0;
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

  for (const sub of expired) {
    if (sub.autoRenew) {
      const cost = sub.plan.renewalTokenCost ?? sub.plan.tokenCost;
      const newValidUntil = new Date(
        now.getTime() + sub.plan.durationDays * 24 * 60 * 60 * 1000,
      );

      const renewed = await prisma.$transaction(async (tx) => {
        const balanceRow = await tx.tokenBalance.findUnique({
          where: { guildId_userId: { guildId, userId } },
        });
        if ((balanceRow?.balance ?? 0) < cost) {
          return false;
        }
        // Atomic test-and-set: only extend if still expired and not cancelled.
        const claimed = await tx.subscription.updateMany({
          where: { id: sub.id, validUntil: { lte: now }, cancelledAt: null },
          data: { validUntil: newValidUntil },
        });
        if (claimed.count === 0) {
          return false;
        }
        await tx.tokenBalance.update({
          where: { guildId_userId: { guildId, userId } },
          data: { balance: { decrement: cost } },
        });
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

      if (renewed) continue;
    }

    // Guard with validUntil: still expired so a concurrently renewed row is never cancelled.
    const cancelled = await prisma.subscription.updateMany({
      where: { id: sub.id, validUntil: { lte: now }, cancelledAt: null },
      data: { cancelledAt: now },
    });

    if (cancelled.count > 0 && sub.plan.roleId) {
      try {
        const member = await guild.members.fetch(userId);
        await member.roles.remove(sub.plan.roleId);
      } catch {
        // Member may have left the guild; ignore role removal failure.
      }
    }
  }
}

export async function grantSubscriptionRole(
  guild: Guild,
  userId: string,
  roleId: string,
): Promise<void> {
  try {
    const member = await guild.members.fetch(userId);
    await member.roles.add(roleId);
  } catch {
    // Member may have left the guild; ignore role grant failure.
  }
}
