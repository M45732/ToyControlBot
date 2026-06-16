import "dotenv/config";

import { getOptionalEnv, getRequiredEnv } from "../lib/env.js";

/**
 * Typed, validated application configuration.
 *
 * Configuration is loaded once at startup from environment variables. Nothing
 * in the codebase should read `process.env` directly outside of this module
 * and `lib/env.ts`.
 */

export type NodeEnv = "development" | "production" | "test";

export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export interface DiscordConfig {
  readonly token: string;
  readonly clientId: string;
  /** Optional guild used for fast, guild-scoped command registration in dev. */
  readonly guildId?: string;
}

export interface EconomyConfig {
  /** Role required to claim the daily token. Daily is disabled if unset. */
  readonly verifiedRoleId?: string;
  /** Role that grants a bonus on the daily token claim. */
  readonly patronRoleId?: string;
}

export interface DatabaseConfig {
  readonly url?: string;
}

export interface LovenseConfig {
  /** Lovense developer API token. Toy control is disabled until this is set. */
  readonly apiToken?: string;
  readonly apiBaseUrl: string;
}

export interface RuntimeConfig {
  readonly nodeEnv: NodeEnv;
  readonly logLevel: LogLevel;
  readonly isProduction: boolean;
}

export interface AppConfig {
  readonly discord: DiscordConfig;
  readonly database: DatabaseConfig;
  readonly runtime: RuntimeConfig;
  readonly economy: EconomyConfig;
  readonly lovense: LovenseConfig;
}

function parseNodeEnv(value: string | undefined): NodeEnv {
  if (value === "production" || value === "test") {
    return value;
  }
  return "development";
}

function parseLogLevel(value: string | undefined): LogLevel {
  const allowed: LogLevel[] = [
    "fatal",
    "error",
    "warn",
    "info",
    "debug",
    "trace",
  ];
  if (value && (allowed as string[]).includes(value)) {
    return value as LogLevel;
  }
  return "info";
}

function loadConfig(): AppConfig {
  const nodeEnv = parseNodeEnv(process.env.NODE_ENV);

  return {
    discord: {
      token: getRequiredEnv("DISCORD_TOKEN"),
      clientId: getRequiredEnv("DISCORD_CLIENT_ID"),
      guildId: getOptionalEnv("DISCORD_GUILD_ID"),
    },
    database: {
      url: getOptionalEnv("DATABASE_URL"),
    },
    runtime: {
      nodeEnv,
      logLevel: parseLogLevel(process.env.LOG_LEVEL),
      isProduction: nodeEnv === "production",
    },
    economy: {
      verifiedRoleId: getOptionalEnv("ROLE_VERIFIED_ID"),
      patronRoleId: getOptionalEnv("ROLE_PATRON"),
    },
    lovense: {
      apiToken: getOptionalEnv("LOVENSE_API_TOKEN"),
      apiBaseUrl: getOptionalEnv(
        "LOVENSE_API_BASE_URL",
        "https://api.lovense-api.com",
      )!,
    },
  };
}

export const config: AppConfig = loadConfig();
