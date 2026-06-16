import { pino, type Logger } from "pino";

import { config } from "../config/index.js";

/**
 * Application-wide structured logger.
 *
 * In development we use `pino-pretty` for readable, colourised output. In
 * production we emit raw JSON so logs can be ingested by a log aggregator.
 *
 * Never log secrets (tokens, API keys) or full private message content.
 */
export const logger: Logger = pino({
  level: config.runtime.logLevel,
  transport: config.runtime.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
});

/**
 * Create a child logger scoped to a feature or module.
 *
 * @example
 *   const log = createLogger("ready");
 *   log.info("Bot is online");
 */
export function createLogger(scope: string): Logger {
  return logger.child({ scope });
}
