import type { ChatInputCommandInteraction, GuildMember } from "discord.js";

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
 * @throws {UserFacingError} If the interaction has no guild context.
 */
export function requireGuildMember(
  interaction: ChatInputCommandInteraction,
): GuildMember {
  const member = interaction.member;
  if (!interaction.guildId || !member || !("roles" in member)) {
    throw new UserFacingError("This command can only be used inside a server.");
  }
  return member as GuildMember;
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
