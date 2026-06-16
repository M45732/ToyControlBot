import type { Client } from "discord.js";

import { config } from "./config/index.js";
import { registerEvents } from "./events/index.js";
import { createClient } from "./lib/client.js";
import { toError } from "./lib/errors.js";
import { logger } from "./lib/logger.js";
import { disconnectDatabase } from "./services/database.service.js";

/**
 * Bot entrypoint.
 *
 * Responsibilities are intentionally minimal: build the client, wire up event
 * handlers, and log in. Feature logic lives in `features/` and `services/`.
 */
async function main(): Promise<void> {
  logger.info(
    { nodeEnv: config.runtime.nodeEnv, logLevel: config.runtime.logLevel },
    "Starting bot",
  );

  const client = createClient();
  registerEvents(client);

  await client.login(config.discord.token);

  installShutdownHandlers(client);
}

function installProcessHandlers(): void {
  process.on("unhandledRejection", (reason) => {
    logger.error({ err: toError(reason) }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
  });
}

function installShutdownHandlers(client: Client): void {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "Shutting down");
    client.destroy();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

installProcessHandlers();

main().catch((error: unknown) => {
  logger.fatal({ err: toError(error) }, "Fatal error during startup");
  process.exit(1);
});
