-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "performerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceTokens" INTEGER NOT NULL,
    "threadId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastChargedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_threadId_key" ON "SubscriptionPlan"("threadId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_guildId_active_idx" ON "SubscriptionPlan"("guildId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_guildId_performerId_key" ON "SubscriptionPlan"("guildId", "performerId");

-- CreateIndex
CREATE INDEX "Subscription_status_expiresAt_idx" ON "Subscription"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Subscription_subscriberId_idx" ON "Subscription"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_planId_subscriberId_key" ON "Subscription"("planId", "subscriberId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
