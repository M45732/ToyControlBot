import {
  GuildMember,
  type BaseInteraction,
  type Guild,
} from "discord.js";

import { UserFacingError } from "../lib/errors.js";

/**
 * Centralized permission and guild-context checks.
 *
 * Command handlers should call these instead of inlining role/permission
 * checks, so behavior stays consistent across features.
 */

/**
 * Fetch a guild member by id, returning null instead of throwing if they
 * aren't a member (or the fetch fails). The shared primitive behind any
 * check that needs to know whether an arbitrary user belongs to an
 * arbitrary guild — e.g. `requireGuildMember` below (against the
 * interaction's own guild) and the control-link feature's raffle-target
 * membership check (against a guild unrelated to where the interaction
 * originated, since that flow can start from a DM).
 */
export async function fetchGuildMember(
  guild: Guild,
  userId: string,
): Promise<GuildMember | null> {
  return guild.members.fetch(userId).catch(() => null);
}

/**
 * Ensure an interaction is being used inside a guild, and return the
 * invoking member.
 *
 * Typed against `BaseInteraction` (rather than a hand-enumerated union of
 * concrete interaction classes) so it works for slash commands, buttons,
 * modals, or any future interaction kind without another signature change —
 * all of them expose the `guildId`/`guild`/`member`/`user` fields this
 * function actually uses.
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
  interaction: BaseInteraction,
): Promise<GuildMember> {
  if (!interaction.guildId || !interaction.guild) {
    throw new UserFacingError("This command can only be used inside a server.");
  }

  const member = interaction.member;
  if (member instanceof GuildMember) {
    return member;
  }

  const fetched = await fetchGuildMember(interaction.guild, interaction.user.id);
  if (!fetched) {
    throw new UserFacingError("This command can only be used inside a server.");
  }
  return fetched;
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
