# Feature Map

This document is the migration roadmap. It tracks every feature that exists in
the legacy bot (`legacy/old-bot-readonly/`), where it lived, and how it is being
rebuilt in the new bot (`apps/bot/`).

Update this file whenever a feature is migrated, changed, skipped, or redesigned.

## What this bot does

ToyControlBot is a Discord bot for controlling Lovense toys from inside a guild.
The core domains are:

- **Lovense control** — pair toys via QR code, run reaction-vote and tip-driven
  control sessions, and send vibration commands through the Lovense API.
- **Token economy** — daily tokens, balances, a leaderboard, and tipping that
  moves tokens between users and triggers toy commands.
- **Control-link sharing** — parse shared remote-control links (Lovense,
  handyfeeling, xtoys) and run a raffle to pick who gets control.
- **Dashboards** — button-driven member / performer / toy-control panels.
- **Channel & moderation helpers** — restrict toy links to allowed channels,
  manage performers per channel.
- **Utility & owner tooling** — ping, help, version, restart, command deploy.

> Legacy stack: discord.js v14, MySQL (`mysql2`), Winston, js-yaml config,
> chart.js. New stack: TypeScript, discord.js v14, Prisma, pino, env-based
> config.

## Status values

| Status | Meaning |
|---|---|
| Not started | Inspected in legacy, not yet rebuilt |
| Planned | Scheduled for rebuild |
| In progress | Currently being rebuilt |
| Migrated | Rebuilt in the new bot |
| Changed | Rebuilt with intentionally changed behavior |
| Skipped | Will not be migrated |
| Replaced | Replaced by a different implementation |

## Roadmap phases

Suggested build order. Later phases depend on earlier ones.

1. **Foundation** — project scaffold, config, logger, client, event/command
   dispatch. *(done)*
2. **Persistence** — Prisma schema + database service for the economy and
   session tables.
3. **Token economy** — daily token, balance, toplist (no toys required; good
   first vertical slice through the new architecture).
4. **Lovense core** — config-driven Lovense client/service, QR pairing.
5. **Control sessions** — reaction-vote sessions (gangbang/orgy), session
   persistence and restore-on-startup.
6. **Tipping** — tip command + tip-mode sessions wired to economy + Lovense.
7. **Control-link sharing & raffles**.
8. **Dashboards** — member / performer / toy-control panels.
9. **Channel & moderation helpers**.
10. **Utility & owner commands**.

## Foundation

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Bot startup / entrypoint | `TCB.js` | Migrated | `apps/bot/src/index.ts` | Clean startup, process handlers, structured logging |
| Discord client / intents | `TCB.js` | Migrated | `apps/bot/src/lib/client.ts` | Minimal intents; expand per feature instead of enabling everything |
| Config loading | `config/*.yml`, `dotenv` | Changed | `apps/bot/src/config/`, `apps/bot/src/lib/env.ts` | Env-based, typed, validated via `getRequiredEnv`. No hardcoded secrets in YAML |
| Logging | `util/Logger.js` (Winston + Discord webhook) | Changed | `apps/bot/src/lib/logger.ts` | pino structured logs; optional webhook transport can be added later |
| Command loader | `handlers/Commands.js` | Migrated (registry) | `apps/bot/src/commands/index.ts` | Typed `SlashCommand` registry; commands added per feature |
| Event loader | `handlers/Events.js`, `validation/EventNames.js` | Migrated (registry) | `apps/bot/src/events/` | Typed `BotEvent` registry |
| Ready event | `events/ready/ready.js` | Migrated (basic) | `apps/bot/src/events/ready.event.ts` | Logs online status. Session restore is deferred to the sessions feature |
| Command registration/deploy | `util/registerCommands.js`, `events/message/messageCreate.js` (`!deploy-*`) | Planned | `apps/bot/src/services/command-deploy.service.ts` | Replace prefix deploy commands with a deploy script / owner slash command |
| Error handling | scattered | In progress | `apps/bot/src/lib/errors.ts` | `UserFacingError` + safe user messages; no stack traces to users |
| Permissions | `validation/Permissions.js` + inline checks | Planned | `apps/bot/src/services/permission.service.ts` | Centralize role / Discord-permission / guild-context checks |
| Database access | `structures/sql/Pool.js` (MySQL, string-interpolated SQL) | Planned | `prisma/schema.prisma`, `apps/bot/src/services/database.service.ts` | **Replace raw SQL with Prisma (fixes SQL-injection risk).** Redesign schema |

## Token economy

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Daily free token | `commands/economy/daily-free-token.js` | Planned | `apps/bot/src/features/economy/` | Base 100 + booster +100 + patron +100, 24h cooldown, streak. Tables `daily_token`, `token_history` |
| Token balance | `commands/economy/token-balance.js` | Planned | `apps/bot/src/features/economy/` | `current` / `history` view. **Reconsider permission** (legacy gated on `BanMembers`) |
| Token toplist | `commands/economy/token-toplist.js` | Planned | `apps/bot/src/features/economy/` | Paginated leaderboard with first/prev/next/last buttons |
| Subscriptions | `commands/economy/subscriptions.js` | Not started | `apps/bot/src/features/subscriptions/` | Legacy is a stub. Decide whether to design properly or skip |

## Lovense control

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Lovense API client | `structures/commands/LovenseConnect.js`, `config/lovenseOptions.yml` | Planned | `apps/bot/src/features/lovense/lovense.client.ts` | QR code, command send, speed ramping. **API tokens MUST come from env, never YAML** |
| QR pairing | `structures/commands/toyControl.js` (`Lovense_create_qr_embed`) | Planned | `apps/bot/src/features/lovense/` | Generate + show pairing QR |
| Control sessions (reaction vote) | `structures/commands/toyControl.js` | Planned | `apps/bot/src/features/lovense/` | gangbang (solo), orgy (group); emoji 1–5 votes drive intensity. Tables `toycontrol`, `toycontrol_user` |
| Session restore on startup | `events/ready/ready.js` | Planned | `apps/bot/src/features/lovense/` | Reload active sessions, clean orphaned ones |
| Vibration patterns | `assets/patterns/**` | Not started | TBD | Pattern files exist but were never parsed in legacy. Decide whether to implement |
| Toy emoji mapping | env `EMOJI_*` | Planned | `apps/bot/src/features/lovense/` | Map toy types to guild emojis |

## Tipping

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Tip command | `commands/lovense/tip.js` | Planned | `apps/bot/src/features/tipping/` | Move tokens sender→receiver, trigger toy, record history. Needs active tip session |
| Tip menu setup | `commands/lovense/setup-tip-menu.js` | Planned | `apps/bot/src/features/tipping/` | 5 levels: intensity/duration/power select menus |
| Tip menu entry | `commands/lovense/setup-tip-menu-entry.js` | Not started | `apps/bot/src/features/tipping/` | Per-level subcommands; legacy partial |

## Control-link sharing & raffles

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Control link parsing | `handlers/messageControlLink.js` | Planned | `apps/bot/src/features/control-link/` | Parse handyfeeling / xtoys / lovense links, extract toys/time/tags |
| Raffle / winner selection | `events/interaction/interactionCreate.js` | Planned | `apps/bot/src/features/control-link/` | Countdown, collect participants, DM winner |
| Restrict toy links to channels | `events/message/messageCreate.js` | Planned | `apps/bot/src/features/control-link/` (or moderation) | Block `lovense-api.com/t2/` links outside allowed channels |

## Dashboards / panels

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Member dashboard | `commands/owner/setup-member-dashboard.js`, `structures/commands/tokenPanel.js` | Planned | `apps/bot/src/features/dashboards/` | Token buy/balance/history + subscription buttons |
| Performer dashboard | `commands/owner/setup-performer-dashboard.js`, `structures/commands/performerPanel.js` | Planned | `apps/bot/src/features/dashboards/` | Home / Tip / Vote / Link / Subscription navigation |
| Toy-control dashboard | `commands/owner/setup-toycontrol-dashboard.js` | Planned | `apps/bot/src/features/dashboards/` | Start gangbang / orgy entry points |

## Channel & moderation helpers

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Block member from channel | `commands/channel/channel-block-member.js` | Not started | `apps/bot/src/features/channel/` | Legacy stub |
| Invite performer | `commands/channel/channel-invite-performer.js` | Not started | `apps/bot/src/features/channel/` | Legacy stub |
| Remove performer | `commands/channel/channel-remove-performer.js` | Not started | `apps/bot/src/features/channel/` | Legacy stub |
| DM handling | `handlers/dmMessage.js` | Not started | TBD | Referenced but unimplemented in legacy; clarify intent before building |

## Utility & owner commands

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| ping | `commands/util/ping.js` | Planned | `apps/bot/src/features/utility/` | Gateway + interaction latency. Drop the odd `BanMembers` gate |
| help | `commands/util/help.js` | Planned | `apps/bot/src/features/utility/` | Generate from command registry |
| version | `commands/owner/version.js` | Planned | `apps/bot/src/features/owner/` | Read from package.json |
| restart | `commands/owner/restart.js` | Planned | `apps/bot/src/features/owner/` | Owner-only; rely on process manager to restart |
| Command deploy/remove (prefix) | `events/message/messageCreate.js` (`!deploy-*`, `!remove-*`) | Replaced | deploy script / owner command | Replace `!`-prefix owner commands with a script or slash command |

## Per-feature behavior notes

### Daily free token

Old: 100 base tokens, +100 if server booster, +100 if `ROLE_PATRON`, 24h
cooldown via `TIMEDIFF`, streak tracking. Writes `daily_token` and
`token_history` (`event_type='daily'`). Verified-role gated.

New: rebuild in `features/economy` over a Prisma model. Keep the bonus rules;
make role IDs and bonus amounts configuration, not hardcoded.

### Tipping

Old: requires an active tip-mode session in the channel. Deducts from sender
balance, credits receiver, records `toycontrol_tip_history` + two
`token_history` rows (`tip_send` / `tip_received`), and triggers the toy.
Administrator-gated.

New: split into an economy service (balance moves) and a Lovense service (toy
trigger), orchestrated by the tipping feature. Use a DB transaction so token
moves are atomic. Reconsider the Administrator gate.

### Control sessions

Old: QR pairing → session message with emoji reactions 1–5; every few seconds
the highest-voted level is sent to all connected toys. Modes: gangbang (solo
controlled by many), orgy (group). Persisted in `toycontrol` /
`toycontrol_user`; restored on startup, orphaned sessions cleaned up.

New: model sessions in Prisma, encapsulate vote tallying + Lovense command
dispatch in a service, and restore active sessions from the ready event.

## How to use this file with AI agents

```txt
Inspect the legacy implementation of <feature> in legacy/old-bot-readonly.
Rebuild it cleanly under apps/bot/src/features/<feature>.
Wire commands into apps/bot/src/commands and events into apps/bot/src/events.
Do not modify the legacy folder. Update docs/feature-map.md after migration,
and docs/migration-notes.md if behavior changed.
```
