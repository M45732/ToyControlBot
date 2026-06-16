export interface DailyClaimResult {
  readonly claimed: boolean;
  readonly tokensAwarded: number;
  readonly boosterBonus: boolean;
  readonly patronBonus: boolean;
  /** Milliseconds until the next claim is available. Only set when `claimed` is false. */
  readonly msUntilNextClaim?: number;
}

export interface ToplistEntry {
  readonly userId: string;
  readonly balance: number;
  readonly rank: number;
}

export interface ToplistPage {
  readonly entries: ToplistEntry[];
  readonly page: number;
  readonly totalPages: number;
}
