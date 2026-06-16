import { Prisma, type PrismaClient } from "@prisma/client";

import { prisma } from "../../services/database.service.js";
import type { DailyClaimResult, ToplistPage } from "./economy.types.js";

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STREAK_GRACE_MS = 48 * 60 * 60 * 1000;
const DAILY_BASE_TOKENS = 100;
const DAILY_BOOSTER_BONUS = 100;
const DAILY_PATRON_BONUS = 100;
const TOPLIST_PAGE_SIZE = 10;

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Add (or subtract) tokens for a user and record the change in history.
 *
 * Runs in a transaction so the balance update and the history row are always
 * consistent.
 */
export async function adjustBalance(
  guildId: string,
  userId: string,
  amount: number,
  eventType: string,
  eventId?: string,
): Promise<void> {
  await prisma.$transaction((tx) =>
    applyBalanceChange(tx, guildId, userId, amount, eventType, eventId),
  );
}

async function applyBalanceChange(
  client: DbClient,
  guildId: string,
  userId: string,
  amount: number,
  eventType: string,
  eventId?: string,
): Promise<void> {
  await client.tokenBalance.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: { balance: { increment: amount } },
    create: { guildId, userId, balance: amount },
  });
  await client.tokenHistory.create({
    data: { guildId, userId, amount, eventType, eventId },
  });
}

/**
 * Get a user's current token balance. Returns 0 if the user has none yet.
 */
export async function getBalance(
  guildId: string,
  userId: string,
): Promise<number> {
  const row = await prisma.tokenBalance.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  return row?.balance ?? 0;
}

/**
 * The deterministic toplist order: balance descending, then `userId` as a
 * stable tie-breaker. Used by both `getRank` and `getToplistPage` so a
 * user's reported rank always matches their position in the rendered list.
 */
const TOPLIST_ORDER_BY: Prisma.TokenBalanceOrderByWithRelationInput[] = [
  { balance: "desc" },
  { userId: "asc" },
];

/**
 * Get a user's 1-based rank in the guild toplist, or `null` if they have no balance row.
 */
export async function getRank(
  guildId: string,
  userId: string,
): Promise<number | null> {
  const row = await prisma.tokenBalance.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });
  if (!row) {
    return null;
  }
  const aheadCount = await prisma.tokenBalance.count({
    where: {
      guildId,
      OR: [
        { balance: { gt: row.balance } },
        { balance: row.balance, userId: { lt: userId } },
      ],
    },
  });
  return aheadCount + 1;
}

/**
 * Get one page of the guild toplist, ordered by balance descending.
 */
export async function getToplistPage(
  guildId: string,
  page: number,
): Promise<ToplistPage> {
  const total = await prisma.tokenBalance.count({ where: { guildId } });
  const totalPages = Math.max(1, Math.ceil(total / TOPLIST_PAGE_SIZE));
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (clampedPage - 1) * TOPLIST_PAGE_SIZE;

  const rows = await prisma.tokenBalance.findMany({
    where: { guildId },
    orderBy: TOPLIST_ORDER_BY,
    skip: offset,
    take: TOPLIST_PAGE_SIZE,
  });

  return {
    entries: rows.map((row, index) => ({
      userId: row.userId,
      balance: row.balance,
      rank: offset + index + 1,
    })),
    page: clampedPage,
    totalPages,
  };
}

export interface TokenHistoryEntry {
  readonly amount: number;
  readonly eventType: string;
  readonly createdAt: Date;
}

/**
 * Get a user's most recent token history entries, newest first.
 */
export async function getHistory(
  guildId: string,
  userId: string,
  limit = 10,
): Promise<TokenHistoryEntry[]> {
  return prisma.tokenHistory.findMany({
    where: { guildId, userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { amount: true, eventType: true, createdAt: true },
  });
}

export interface ClaimDailyOptions {
  readonly isBooster: boolean;
  readonly isPatron: boolean;
  readonly eventId?: string;
}

/**
 * Claim the daily token for a user, applying the 24h cooldown, booster/patron
 * bonuses, and streak tracking.
 *
 * The cooldown check and the redeem/balance/history writes happen as one
 * atomic claim inside a transaction: concurrent claims for the same user
 * race on conditional updates (and a unique-constraint guard for first-time
 * claims), so only one request can ever win a given 24h window.
 */
export async function claimDaily(
  guildId: string,
  userId: string,
  options: ClaimDailyOptions,
): Promise<DailyClaimResult> {
  const now = new Date();
  const cooldownThreshold = new Date(now.getTime() - DAILY_COOLDOWN_MS);
  const streakGraceThreshold = new Date(now.getTime() - STREAK_GRACE_MS);

  let tokensAwarded = DAILY_BASE_TOKENS;
  if (options.isBooster) {
    tokensAwarded += DAILY_BOOSTER_BONUS;
  }
  if (options.isPatron) {
    tokensAwarded += DAILY_PATRON_BONUS;
  }

  const claimed = await prisma.$transaction(async (tx) => {
    // Last claim was 24-48h ago: redeem and continue the streak.
    const continued = await tx.dailyToken.updateMany({
      where: {
        guildId,
        userId,
        lastRedeem: { lt: cooldownThreshold, gte: streakGraceThreshold },
      },
      data: { lastRedeem: now, streakDays: { increment: 1 } },
    });
    if (continued.count === 0) {
      // Last claim was more than 48h ago: redeem and reset the streak.
      const resumed = await tx.dailyToken.updateMany({
        where: { guildId, userId, lastRedeem: { lt: streakGraceThreshold } },
        data: { lastRedeem: now, streakDays: 1 },
      });
      if (resumed.count === 0) {
        // No row yet for this user; create one unless a concurrent claim
        // wins the race first (unique constraint), or the user is already
        // on cooldown (neither update above matched, so the row exists and
        // its lastRedeem is within the last 24h).
        try {
          await tx.dailyToken.create({
            data: { guildId, userId, lastRedeem: now, streakDays: 1 },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            return false;
          }
          throw error;
        }
      }
    }

    await applyBalanceChange(
      tx,
      guildId,
      userId,
      tokensAwarded,
      "daily",
      options.eventId,
    );
    return true;
  });

  if (!claimed) {
    const existing = await prisma.dailyToken.findUnique({
      where: { guildId_userId: { guildId, userId } },
    });
    const msSinceLastClaim = existing
      ? now.getTime() - existing.lastRedeem.getTime()
      : 0;
    return {
      claimed: false,
      tokensAwarded: 0,
      boosterBonus: false,
      patronBonus: false,
      msUntilNextClaim: Math.max(DAILY_COOLDOWN_MS - msSinceLastClaim, 0),
    };
  }

  return {
    claimed: true,
    tokensAwarded,
    boosterBonus: options.isBooster,
    patronBonus: options.isPatron,
  };
}
