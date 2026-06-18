-- CreateTable
CREATE TABLE "ToyControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "sessionMode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ToyControlUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ToyControlUser_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ToyControl" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TipHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ToyControl_messageId_key" ON "ToyControl"("messageId");

-- CreateIndex
CREATE INDEX "ToyControl_guildId_active_idx" ON "ToyControl"("guildId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ToyControlUser_sessionId_userId_key" ON "ToyControlUser"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "TipHistory_guildId_messageId_idx" ON "TipHistory"("guildId", "messageId");
