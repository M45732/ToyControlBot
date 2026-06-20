# Migration Notes

This document tracks important decisions, behavior changes, skipped legacy
features, and migration risks during the bot rewrite.

## Migration principle

The new bot is not a line-by-line rewrite. The legacy bot
(`legacy/old-bot-readonly/`) is used to understand existing behavior; the new
bot should be cleaner, safer, and easier to maintain.

## Global decisions

| Date | Decision | Reason |
|---|---|---|
| 2026-06-16 | Start clean rewrite in `apps/bot/` | Avoid carrying legacy architecture problems forward |
| 2026-06-16 | Keep legacy code read-only in `legacy/old-bot-readonly/` | Reference without polluting the new architecture |
| 2026-06-16 | TypeScript with `strict` typing | Maintainability and safer refactoring |
| 2026-06-16 | Env-based config via `getRequiredEnv`; no YAML secrets | Legacy committed API tokens in `config/lovenseOptions.yml` |
| 2026-06-16 | Replace raw MySQL string-interpolated queries with Prisma | Legacy was SQL-injection prone; Prisma gives typed, parameterized access |
| 2026-06-16 | Prefer slash commands; drop `!`-prefix owner commands | Modern interaction model |
| 2026-06-16 | pino structured logging instead of Winston | Lightweight, JSON-friendly |
| 2026-06-16 | Minimal Discord intents, expanded per feature | Legacy enabled nearly every intent; reduce scope |
| 2026-06-16 | Centralize permission checks in a service | Legacy checks were inconsistent and inlined |
| 2026-06-16 | Add a button-handler registry (`apps/bot/src/buttons/`) alongside the command registry | Mirrors the typed command dispatch pattern for interactive components (e.g. toplist pagination) |
| 2026-06-16 | Wire `interactionCreate` to dispatch commands and buttons, with errors converted to safe user-facing replies | Required for any slash command to actually run; centralizes error-to-message handling |
| 2026-06-16 | Lovense API token is read lazily from config on each call (`LOVENSE_API_TOKEN`, optional) instead of being required at startup | Lets a guild run the bot before toy control is configured; `/toy-connect` and `/toy-status` fail with a friendly message instead of crashing the whole process on boot |

## Behavior changes

| Feature | Old Behavior | New Behavior | Reason |
|---|---|---|---|
| Lovense API credentials | Hardcoded in `config/lovenseOptions.yml` | Loaded from environment | Secrets must never be committed |
| Database access | Raw MySQL via `getDataFromDB(query)` with string interpolation | Prisma models + service layer | Security + maintainability |
| Command deploy | `!deploy-guild-commands` / `!deploy-global-commands` chat commands | `npm run deploy-commands` script (`apps/bot/src/scripts/deploy-commands.ts`) | Remove prefix commands |
| `ping` / `token-balance` permissions | Gated on `BanMembers` (unusual for read-only utility) | Gate removed; everyone can check their own balance/history | The legacy gate looked accidental, not intentional |
| `daily` verified-role gate | Hardcoded check against `ROLE_VERIFIED_ID` env var; failed loudly if unset | Gate is skipped entirely when `ROLE_VERIFIED_ID` is not configured | Avoids a hard dependency on a specific guild's role setup during early development |
| `token-toplist` pagination | Parsed the page number out of the embed footer text on each button click | Page number is encoded directly in the button `customId` (`economy:toplist:<page>`) | Simpler, doesn't depend on embed text formatting |
| `daily` claim concurrency | No protection against concurrent claims (read-then-write race in app code) | Cooldown check + redeem update + balance/history write happen as one atomic claim inside a transaction (conditional `updateMany`s plus a unique-constraint guard on first claim) | Caught in review: two simultaneous `/daily` invocations could otherwise both pass the cooldown check and mint duplicate tokens |
| Daily token streak | Column existed (`streakDay`) but was never actually incremented in legacy code | Streak increments when the previous claim was within 48h of now, otherwise resets to 1 | Implements the documented intent; not yet surfaced in the daily embed |
| `token-toplist` pagination target user | N/A (new feature) | The originally-requested user id is encoded in the button `customId` (`economy:toplist:<page>:<targetUserId>`) so paging keeps reporting that user's rank, regardless of who clicks the button | Caught in review: without this, pagination buttons reported the button-clicker's rank instead of the originally requested user's |
| `requireGuildMember` member resolution | N/A (new feature) | Returns the cached `GuildMember` only if `interaction.member instanceof GuildMember`; otherwise fetches the member explicitly via `interaction.guild.members.fetch(...)` | Caught in review: when the guild isn't cached, discord.js hands back the raw API interaction-member shape (`roles: string[]`, `premium_since`), which the old type-cast silently misread — `isServerBooster` saw `premiumSince === undefined` and granted the booster bonus to everyone |
| Lovense `/api/lan/getQrCode` host | Mixed `apps.lovense.com` (commented out) and `api.lovense-api.com` calls across legacy files | Standardized on `api.lovense-api.com`, configurable via `LOVENSE_API_BASE_URL` | Legacy code had both hosts present (one commented out); picked the one actually in use and made it overridable instead of hardcoded |
| Lovense API-down error reporting | Pinged a hardcoded Discord user ID (`<@244454602517381120>`) in a non-ephemeral channel message with the raw API error code | Throws a `UserFacingError` with a friendly message, shown ephemerally to the requesting user; the raw code/message is logged internally instead | Hardcoding a personal Discord ID is not portable across servers, and surfacing raw API errors/non-ephemeral messages doesn't fit the new error-handling convention (see `lib/errors.ts`) |
| Toy battery reporting (`-1` battery) | Treated as `100%` inline in the QR/session embed code | Same behavior, moved into `lovense.service.ts` (`getConnectedToys`) | Preserved intentionally — some toys don't report battery and the API returns `-1` for them |
| Subscriptions | UI scaffolding only: `/subscriptions` was a stub with a broken `toycontrol` query; the performer panel had a setup modal and stats panels but no persistence or billing | Full token-priced fanclub: `SubscriptionPlan` + `Subscription` Prisma models, `/subscribe`, `/subscriptions`, `/subscription-cancel`, `/subscription-setup`, `/subscription-stats`, and an hourly auto-renew sweep | Legacy never implemented it; rebuilt deliberately rather than ported |
| Subscription access mechanism | Legacy comments referenced a "premium channel" + "Link to thread" | Access granted by **private-thread membership**, not a dedicated channel or role | Threads avoid the per-guild channel cap, so one server can host many fanclubs (raised in design review) |
| Subscription billing | "Auto renew: Yes" / "Renewal costs: 1000 tokens" comments, never coded | Per-subscription `autoRenew` flag; hourly sweep charges due renewals from the token balance, lapsing + removing from the thread on insufficient funds or auto-renew off | Implements the documented intent; charge is conditional (`balance >= price`) so it can never go negative, transient errors retry next sweep instead of revoking access |

> Add a row here whenever rebuilt behavior differs from the legacy bot.

## Skipped / undecided legacy features

| Feature | Old Location | Status / Reason |
|---|---|---|
| Vibration pattern files | `assets/patterns/**` | Present but never parsed in legacy; only migrate if patterns are actually wanted |
| DM handler | `handlers/dmMessage.js` | Referenced but unimplemented; clarify intent before building |
| `_backup_dev/` experiments | `legacy/old-bot-readonly/_backup_dev/` | Dead/experimental code; reference only, do not migrate |
| Channel performer commands | `commands/channel/*` | Legacy stubs; rebuild only if the workflow is still needed |

## Replaced legacy features

| Old Feature | New Feature | Reason |
|---|---|---|
| `handlers/Commands.js` + `handlers/Events.js` dynamic loaders | Typed `commands`/`events` registries | Explicit, type-checked registration |
| Winston + `winston3-discord` | pino (+ optional webhook transport later) | Simpler structured logging |
| MySQL `Pool.js` | Prisma + `database.service.ts` | Typed, parameterized DB access |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Lovense API tokens committed in legacy YAML** | Credentials are compromised | Treat as leaked and **rotate the Lovense API tokens**; load new ones from env only (see checklist below) |
| SQL injection in legacy queries | Data integrity / security | Use Prisma with parameterized queries in the rewrite |
| Data migration from MySQL → new schema | Existing balances/sessions may not map cleanly | Write an explicit migration plan before going live; redesign the schema deliberately |
| Permission drift | Users may gain/lose access vs. legacy | Centralize checks; review each command's gate during migration |
| Active sessions lost on cutover | In-flight toy sessions interrupted | Implement session restore; plan a low-traffic cutover |
| Command renames | User confusion | Document renames and keep names stable where possible |

## Security: secret cleanup checklist

Findings from inspecting `legacy/old-bot-readonly/` (read-only):

- [x] **Lovense API tokens hardcoded** in `config/lovenseOptions.yml`
      (`token`, `token2`) — **assume compromised, rotate.**
- [x] Discord bot token, client secret, webhook token, MySQL password are
      referenced via `env_example` (not committed values) — keep them in env.
- [ ] Rotate the Lovense API tokens and store the new values only in `.env`.
- [ ] Confirm no real `.env`, database dump, or log with secrets is committed
      anywhere in the repo history.

Because the legacy folder is read-only, these secrets are **not** edited there;
they are documented here and excluded from the new bot, which reads all
credentials from the environment.

## Legacy import rule

The new bot must never import runtime code from `legacy/old-bot-readonly/`. The
legacy folder is documentation by example, not a dependency.

## Migration workflow

For each feature:

1. Locate the legacy implementation.
2. Confirm its behavior is captured in `docs/feature-map.md`.
3. Decide: preserve, improve, replace, or skip.
4. Build the new version under `apps/bot/src/features/`.
5. Test manually.
6. Update `docs/feature-map.md` (status + new location).
7. Record any behavior change here.

## Known architectural gaps

| Gap | Impact | Resolution |
|---|---|---|
| **No Lovense callback/webhook receiver** | The Lovense Standard API POSTs device data (local IP, port, toy list) to a registered callback URL after QR pairing. Without a running HTTPS receiver and persistent storage of that payload, `/toy-status` (GetToys) may return empty results even when the app is paired and online in a typical cloud deployment. This is *not* a code bug — the same cloud-API GetToys approach was used in the legacy bot. | Implement a callback receiver + a `LovenseDevice` Prisma model in the control-sessions phase (phase 5). `/toy-status` is intentionally kept as scaffolding. |
| **Subscription thread membership is not transactional with the DB** | Token moves are atomic (Prisma transactions), but granting/revoking access is a Discord API call (`thread.members.add/remove`) that can't share that transaction. So there is always a sub-second window between a committed subscription row and the matching membership change, plus exposure to transient Discord failures / permission blips. | Mitigated, not eliminated: charge-after-grant on subscribe with rollback-revoke, conditional row claims on renew/lapse, bounded retry on add/remove, recheck-and-re-add after a lapse that raced a renewal, and the hourly renewal sweep re-adding paid members. The residual (persistent Discord outage / misconfigured permissions) is an **ops concern**. A full fix would be a durable membership-reconciliation ledger (pending-ops table + retry worker) — deferred as a separate task; **decided 2026-06-20 to leave the thread-move race as-is** (guard + self-heal) rather than adopt Serializable transactions or membership migration. |

## Open questions

| Question | Decision needed |
|---|---|
| Keep the subscriptions feature, or drop it? | Resolved: built as a token-priced, private-thread fanclub (see behavior-changes table) |
| Should the 30-day period / hourly sweep interval be configurable? | Currently constants in `subscription.types.ts` / `subscription.scheduler.ts`; promote to env if guilds need different cadences |
| Implement vibration pattern files, or skip? | Product decision |
| Should `ping` / read-only commands keep the `BanMembers` gate? | Resolved: relaxed for `token-balance` / `token-toplist`. `ping` itself is not yet migrated |
| One database per environment (dev/prod)? | Ops decision |
| Register commands guild-scoped during development? | Recommended for fast iteration |
| Data migration from the legacy MySQL database? | Need source data + mapping plan |
