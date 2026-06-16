import { PrismaClient } from "@prisma/client";

import { createLogger } from "../lib/logger.js";

const log = createLogger("database");

/**
 * Application-wide Prisma client.
 *
 * Command handlers and events must never import `@prisma/client` directly;
 * go through this client (wrapped by feature services) instead.
 */
export const prisma = new PrismaClient();

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  log.info("Disconnected from database");
}
