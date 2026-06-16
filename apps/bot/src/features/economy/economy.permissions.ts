import type { GuildMember } from "discord.js";

import { config } from "../../config/index.js";
import { memberHasRole } from "../../services/permission.service.js";

/**
 * Whether the daily token command is gated behind a verified role.
 *
 * If `ROLE_VERIFIED_ID` is not configured, the gate is disabled and everyone
 * may claim.
 */
export function isVerified(member: GuildMember): boolean {
  if (!config.economy.verifiedRoleId) {
    return true;
  }
  return memberHasRole(member, config.economy.verifiedRoleId);
}

export function isPatron(member: GuildMember): boolean {
  return memberHasRole(member, config.economy.patronRoleId);
}

export function isServerBooster(member: GuildMember): boolean {
  return member.premiumSince !== null;
}
