import { Client, GatewayIntentBits, Partials } from "discord.js";

/**
 * Create the Discord client with the intents the bot needs.
 *
 * Intents are intentionally kept minimal. Add new intents only when a feature
 * requires them, and document why in the feature's migration notes. Privileged
 * intents (`GuildMembers`, `MessageContent`, `GuildPresences`) must also be
 * enabled in the Discord Developer Portal.
 */
export function createClient(): Client {
  return new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      // Needed so the subscriptions feature can reliably read a single thread's
      // membership (ThreadMemberManager#fetch) before granting/revoking fanclub
      // access. Privileged — must be enabled in the Discord Developer Portal.
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
  });
}
