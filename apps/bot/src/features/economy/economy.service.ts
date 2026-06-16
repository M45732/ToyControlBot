import { prisma } from "../../services/database.service.js";
import type { DailyClaimResult, ToplistPage } from "./economy.types.js";

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STREAK_GRACE_MS = 48 * 60 * 60 * 1000;
const DAILY_BASE_TOKENS = 100;
const DAILY_BOOSTER_BONUS = 100;
const DAILY_PATRON_BONUS = 100;
const TOPLIST_PAGE_SIZE = 10;

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
  await prisma.$transaction([
    prisma.tokenBalance.upsert({
      where: { guildId_userId: { guildId, userId } },
      update: { balance: { increment: amount } },
      create: { guildId, userId, balance: amount },
    }),
    prisma.tokenHistory.create({
      data: { guildId, userId, amount, eventType, eventId },
    }),
  ]);
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
  const higherCount = await prisma.tokenBalance.count({
    where: { guildId, balance: { gt: row.balance } },
  });
  return higherCount + 1;
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
    orderBy: { balance: "desc" },
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
 */
export async function claimDaily(
  guildId: string,
  userId: string,
  options: ClaimDailyOptions,
): Promise<DailyClaimResult> {
  const now = new Date();
  const existing = await prisma.dailyToken.findUnique({
    where: { guildId_userId: { guildId, userId } },
  });

  if (existing) {
    const msSinceLastClaim = now.getTime() - existing.lastRedeem.getTime();
    if (msSinceLastClaim < DAILY_COOLDOWN_MS) {
      return {
        claimed: false,
        tokensAwarded: 0,
        boosterBonus: false,
        patronBonus: false,
        msUntilNextClaim: DAILY_COOLDOWN_MS - msSinceLastClaim,
      };
    }
  }

  let tokensAwarded = DAILY_BASE_TOKENS;
  if (options.isBooster) {
    tokensAwarded += DAILY_BOOSTER_BONUS;
  }
  if (options.isPatron) {
    tokensAwarded += DAILY_PATRON_BONUS;
  }

  const msSinceLastClaim = existing
    ? now.getTime() - existing.lastRedeem.getTime()
    : undefined;
  const streakDays =
    existing &&
    msSinceLastClaim !== undefined &&
    msSinceLastClaim < STREAK_GRACE_MS
      ? existing.streakDays + 1
      : 1;

  await prisma.dailyToken.upsert({
    where: { guildId_userId: { guildId, userId } },
    update: { lastRedeem: now, streakDays },
    create: { guildId, userId, lastRedeem: now, streakDays },
  });

  await adjustBalance(guildId, userId, tokensAwarded, "daily", options.eventId);

  return {
    claimed: true,
    tokensAwarded,
    boosterBonus: options.isBooster,
    patronBonus: options.isPatron,
  };
}
