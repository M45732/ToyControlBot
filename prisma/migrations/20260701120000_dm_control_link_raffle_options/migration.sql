-- AlterTable
ALTER TABLE "Raffle" ADD COLUMN "anonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "message" TEXT;
