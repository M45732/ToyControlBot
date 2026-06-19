-- CreateTable
CREATE TABLE "TokenBalance" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenHistory" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyToken" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastRedeem" TIMESTAMP(3) NOT NULL,
    "streakDays" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DailyToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TokenBalance_guildId_balance_idx" ON "TokenBalance"("guildId", "balance");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBalance_guildId_userId_key" ON "TokenBalance"("guildId", "userId");

-- CreateIndex
CREATE INDEX "TokenHistory_guildId_userId_createdAt_idx" ON "TokenHistory"("guildId", "userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyToken_guildId_userId_key" ON "DailyToken"("guildId", "userId");
