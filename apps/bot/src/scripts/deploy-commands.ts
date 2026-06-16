import { REST, Routes } from "discord.js";

import { commands } from "../commands/index.js";
import { config } from "../config/index.js";
import { createLogger } from "../lib/logger.js";

const log = createLogger("deploy-commands");

/**
 * Register all slash commands with Discord.
 *
 * Replaces the legacy `!deploy-guild-commands` / `!deploy-global-commands`
 * chat commands. Run with `npm run deploy-commands`.
 *
 * Registers guild-scoped commands (fast propagation) when `DISCORD_GUILD_ID`
 * is set, otherwise registers global commands (can take up to an hour to
 * propagate).
 */
async function main(): Promise<void> {
  const rest = new REST().setToken(config.discord.token);
  const body = commands.map((command) => command.data.toJSON());

  const route = config.discord.guildId
    ? Routes.applicationGuildCommands(
        config.discord.clientId,
        config.discord.guildId,
      )
    : Routes.applicationCommands(config.discord.clientId);

  await rest.put(route, { body });

  log.info(
    { count: body.length, scope: config.discord.guildId ? "guild" : "global" },
    "Deployed slash commands",
  );
}

main().catch((error: unknown) => {
  log.error({ err: error }, "Failed to deploy commands");
  process.exit(1);
});
