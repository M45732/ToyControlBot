import {
  GuildMember,
  type ChatInputCommandInteraction,
  type ButtonInteraction,
} from "discord.js";

import { UserFacingError } from "../lib/errors.js";

/**
 * Centralized permission and guild-context checks.
 *
 * Command handlers should call these instead of inlining role/permission
 * checks, so behavior stays consistent across features.
 */

/**
 * Ensure a command is being used inside a guild, and return the invoking
 * member.
 *
 * `interaction.member` is only a real `GuildMember` (with a `roles` cache
 * and camelCase fields) when the guild is already cached; otherwise
 * discord.js falls back to the raw API interaction-member shape, which has a
 * plain `roles` array and `premium_since` instead. Fetching explicitly when
 * it isn't a `GuildMember` avoids silently misreading that shape (e.g.
 * `premiumSince` reading as `undefined` and granting the booster bonus to
 * everyone).
 *
 * @throws {UserFacingError} If the interaction has no guild context.
 */
export async function requireGuildMember(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
): Promise<GuildMember> {
  if (!interaction.guildId || !interaction.guild) {
    throw new UserFacingError("This command can only be used inside a server.");
  }

  const member = interaction.member;
  if (member instanceof GuildMember) {
    return member;
  }

  try {
    return await interaction.guild.members.fetch(interaction.user.id);
  } catch {
    throw new UserFacingError("This command can only be used inside a server.");
  }
}

/**
 * Check whether a guild member has the given role.
 *
 * Returns `false` (rather than throwing) when `roleId` is not configured, so
 * optional role gates can be skipped cleanly.
 */
export function memberHasRole(
  member: GuildMember,
  roleId: string | undefined,
): boolean {
  if (!roleId) {
    return false;
  }
  return member.roles.cache.has(roleId);
}
