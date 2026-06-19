export interface SubscriptionPlanData {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly tokenCost: number;
  readonly durationDays: number;
  readonly renewalTokenCost: number | null;
  readonly roleId: string | null;
  readonly active: boolean;
}

export interface SubscriptionData {
  readonly id: string;
  readonly userId: string;
  readonly planId: string;
  readonly planName: string;
  readonly autoRenew: boolean;
  readonly roleGranted: boolean;
  readonly validUntil: Date;
  readonly cancelledAt: Date | null;
  readonly createdAt: Date;
}

export interface BuyResult {
  readonly success: boolean;
  readonly reason?: "insufficient_tokens" | "plan_not_found" | "already_active";
  readonly subscription?: SubscriptionData;
  readonly tokensSpent?: number;
}

export interface RenewResult {
  readonly renewed: boolean;
  readonly reason?: "insufficient_tokens" | "already_active";
  readonly tokensSpent?: number;
  readonly newValidUntil?: Date;
}
