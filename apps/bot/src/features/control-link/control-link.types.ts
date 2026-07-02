export interface ParsedControlLink {
  readonly url: string;
  readonly provider: "lovense" | "handyfeeling" | "xtoys";
}

/** Optional raffle presentation choices, currently only settable via the DM flow. */
export interface RaffleOptions {
  readonly anonymous?: boolean;
  readonly message?: string;
}
