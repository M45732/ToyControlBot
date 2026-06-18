-- CreateTable
CREATE TABLE "Raffle" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "linkProvider" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Raffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaffleParticipant" (
    "id" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RaffleParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Raffle_messageId_key" ON "Raffle"("messageId");

-- CreateIndex
CREATE INDEX "Raffle_guildId_active_idx" ON "Raffle"("guildId", "active");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "RaffleParticipant_raffleId_userId_key" ON "RaffleParticipant"("raffleId", "userId");

-- AddForeignKey
ALTER TABLE "RaffleParticipant" ADD CONSTRAINT "RaffleParticipant_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "Raffle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
