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

> Add a row here whenever rebuilt behavior differs from the legacy bot.

## Skipped / undecided legacy features

| Feature | Old Location | Status / Reason |
|---|---|---|
| Subscriptions | `commands/economy/subscriptions.js` | Legacy is a stub; decide whether to design properly or drop |
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

## Open questions

| Question | Decision needed |
|---|---|
| Keep the subscriptions feature, or drop it? | Product decision |
| Implement vibration pattern files, or skip? | Product decision |
| Should `ping` / read-only commands keep the `BanMembers` gate? | Resolved: relaxed for `token-balance` / `token-toplist`. `ping` itself is not yet migrated |
| One database per environment (dev/prod)? | Ops decision |
| Register commands guild-scoped during development? | Recommended for fast iteration |
| Data migration from the legacy MySQL database? | Need source data + mapping plan |
