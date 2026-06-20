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
   session tables. *(done — economy tables only; session tables land with
   Lovense control sessions)*
3. **Token economy** — daily token, balance, toplist (no toys required; good
   first vertical slice through the new architecture). *(done)*
4. **Lovense core** — config-driven Lovense client/service, QR pairing. *(done)*
5. **Control sessions** — reaction-vote sessions (gangbang/orgy), session
   persistence and restore-on-startup. *(done)*
6. **Tipping** — tip command + tip-mode sessions wired to economy + Lovense. *(done)*
7. **Control-link sharing & raffles**. *(done)*
8. **Dashboards** — member / performer / toy-control panels. *(done)*
9. **Channel & moderation helpers**. *(done)*
10. **Utility & owner commands**. *(done)*

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
| Command registration/deploy | `util/registerCommands.js`, `events/message/messageCreate.js` (`!deploy-*`) | Migrated | `apps/bot/src/scripts/deploy-commands.ts` | `npm run deploy-commands`; guild-scoped if `DISCORD_GUILD_ID` is set, else global |
| Interaction dispatch | `events/interaction/interactionCreate.js` | Migrated (commands + buttons) | `apps/bot/src/events/interactionCreate.event.ts` | Dispatches slash commands via the command registry and buttons via a new button-handler registry (`apps/bot/src/buttons/`) |
| Error handling | scattered | Migrated | `apps/bot/src/lib/errors.ts`, wired into `interactionCreate.event.ts` | `UserFacingError` + safe user messages; no stack traces to users |
| Permissions | `validation/Permissions.js` + inline checks | Migrated (core) | `apps/bot/src/services/permission.service.ts` | `requireGuildMember` + `memberHasRole`; feature-specific gates (e.g. verified/patron) live in each feature's `*.permissions.ts` |
| Database access | `structures/sql/Pool.js` (MySQL, string-interpolated SQL) | Migrated (economy) | `prisma/schema.prisma`, `apps/bot/src/services/database.service.ts` | **Replaced raw SQL with Prisma (fixes SQL-injection risk).** `TokenBalance` / `TokenHistory` / `DailyToken` models added; session tables to follow with Lovense |

## Token economy

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Daily free token | `commands/economy/daily-free-token.js` | Migrated | `apps/bot/src/features/economy/` | Base 100 + booster +100 + patron +100, 24h cooldown, streak. Models `DailyToken`, `TokenHistory`. Verified-role gate is optional (skipped if `ROLE_VERIFIED_ID` unset) |
| Token balance | `commands/economy/token-balance.js` | Migrated | `apps/bot/src/features/economy/` | `current` / `history` view via `/token-balance view:`. Dropped the `BanMembers` gate (see migration notes) |
| Token toplist | `commands/economy/token-toplist.js` | Migrated | `apps/bot/src/features/economy/` | Paginated leaderboard with first/prev/next/last buttons, dispatched through the new button-handler registry |
| Subscriptions | `commands/economy/subscriptions.js`, `structures/commands/performerPanel.js` | Migrated (redesigned) | `apps/bot/src/features/subscriptions/` | Legacy was UI scaffolding only (no DB, broken query). Rebuilt as a token-priced fanclub: performers gate a **private thread**, members pay tokens to join, auto-renew sweep re-charges or revokes access. See the section below |

## Lovense control

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Lovense API client | `structures/commands/LovenseConnect.js`, `config/lovenseOptions.yml` | Migrated | `apps/bot/src/features/lovense/lovense.client.ts` | `requestQrCode` + `getToys` + `sendVibrate` against the typed API. Token loaded from `LOVENSE_API_TOKEN` env var, never YAML |
| QR pairing | `structures/commands/toyControl.js` (`Lovense_create_qr_embed`) | Migrated | `apps/bot/src/features/lovense/` | `/toy-connect` slash command shows the pairing QR + code as an ephemeral embed |
| Toy connection status | `structures/commands/LovenseConnect.js` (`LovenseConnect_GetConnectedToys`) | Migrated | `apps/bot/src/features/lovense/` | `/toy-status` slash command |
| Control sessions (reaction vote) | `structures/commands/toyControl.js` | Migrated | `apps/bot/src/features/lovense/session.*.ts` | `/toy-session mode:gangbang\|orgy`. 5-second vote loop. Leave/join buttons. Prisma models `ToyControl`, `ToyControlUser` |
| Session restore on startup | `events/ready/ready.js` | Migrated | `apps/bot/src/events/ready.event.ts` | Calls `restoreActiveSessions()` on ready; orphaned sessions cleaned up |
| Vibration patterns | `assets/patterns/**` | Skipped | — | Pattern files were never parsed in legacy. Not implementing in the new bot |
| Toy emoji mapping | env `EMOJI_*` | Skipped | — | Not required for the core vote-level UX |

## Tipping

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Tip command | `commands/lovense/tip.js` | Migrated | `apps/bot/src/features/tipping/` | `/tip amount message`. Deducts from sender, credits each session participant, triggers toy. Requires active `/toy-session` in channel |
| Tip menu setup | `commands/lovense/setup-tip-menu.js` | Skipped | — | Legacy was incomplete; the new tip flow is triggered directly via `/tip` |
| Tip menu entry | `commands/lovense/setup-tip-menu-entry.js` | Skipped | — | Legacy partial; skipped in favour of direct `/tip` |

## Control-link sharing & raffles

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Control link parsing | `handlers/messageControlLink.js` | Migrated | `apps/bot/src/features/control-link/` | Detects lovense / handyfeeling / xtoys links in messages via `messageCreate` event |
| Raffle / winner selection | `events/interaction/interactionCreate.js` | Migrated | `apps/bot/src/features/control-link/` | Enter Raffle + Pick Winner buttons; winner DMed the link |
| Restrict toy links to channels | `events/message/messageCreate.js` | Migrated | `apps/bot/src/events/messageCreate.event.ts` | Set `CHAN_ID_TOY_LINK`; links outside that channel are deleted and the author is DMed |

## Dashboards / panels

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Member dashboard | `commands/owner/setup-member-dashboard.js`, `structures/commands/tokenPanel.js` | Migrated | `apps/bot/src/features/dashboards/` | `/setup-member-dashboard` — token balance/daily/toplist buttons |
| Performer dashboard | `commands/owner/setup-performer-dashboard.js`, `structures/commands/performerPanel.js` | Migrated | `apps/bot/src/features/dashboards/` | `/setup-performer-dashboard` — start-session + connect-toy buttons |
| Toy-control dashboard | `commands/owner/setup-toycontrol-dashboard.js` | Migrated | `apps/bot/src/features/dashboards/` | `/setup-toycontrol-dashboard` — gangbang / orgy entry points |

## Channel & moderation helpers

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Block member from channel | `commands/channel/channel-block-member.js` | Migrated | `apps/bot/src/features/channel/` | `/channel-block member` — sets `ViewChannel: false` permission override |
| Invite performer | `commands/channel/channel-invite-performer.js` | Migrated | `apps/bot/src/features/channel/` | `/channel-invite-performer member` — grants `ViewChannel + SendMessages` |
| Remove performer | `commands/channel/channel-remove-performer.js` | Migrated | `apps/bot/src/features/channel/` | `/channel-remove-performer member` — removes permission override |
| DM handling | `handlers/dmMessage.js` | Skipped | — | Unimplemented in legacy; intent unclear |

## Utility & owner commands

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| ping | `commands/util/ping.js` | Migrated | `apps/bot/src/features/utility/` | `/ping` — round-trip + WebSocket latency. `BanMembers` gate dropped |
| help | `commands/util/help.js` | Migrated | `apps/bot/src/features/utility/` | `/help` — auto-generated from command registry |
| version | `commands/owner/version.js` | Migrated | `apps/bot/src/features/owner/` | `/version` — reads from `package.json` |
| restart | `commands/owner/restart.js` | Migrated | `apps/bot/src/features/owner/` | `/restart` — owner-only; `process.exit(0)` for process manager restart |
| Command deploy/remove (prefix) | `events/message/messageCreate.js` (`!deploy-*`, `!remove-*`) | Replaced | `npm run deploy-commands` | Replaced by the existing `deploy-commands` script |

## Subscriptions (fanclubs)

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Member subscription list | `commands/economy/subscriptions.js` | Migrated (redesigned) | `apps/bot/src/features/subscriptions/` | `/subscriptions` lists a member's active subscriptions (plan, price, renews-at, auto-renew, fanclub link) |
| Subscribe to a performer | (new) | Added | `apps/bot/src/features/subscriptions/` | `/subscribe performer:@x` — atomic token charge (debit subscriber, credit performer), then add to the fanclub thread |
| Cancel / auto-renew toggle | performer panel "Auto renew" intent | Migrated (redesigned) | `apps/bot/src/features/subscriptions/` | `/subscription-cancel` turns off auto-renew; access stays until the period ends |
| Subscription setup | `performerPanel.js` (`subscriptionSetupModal`) | Migrated (redesigned) | `apps/bot/src/features/subscriptions/` | `/subscription-setup name price [thread] [description]` — one plan per performer, gated on a thread you own (or `ManageThreads`) |
| Subscriber / income stats | `performerPanel.js` ("Active Subscriber" panel) | Migrated (redesigned) | `apps/bot/src/features/subscriptions/` | `/subscription-stats` — active subscribers, projected income, all-time subscribers, lifetime earned |
| Auto-renew billing | "Auto renew: Yes" / "Renewal costs" comments | Added | `apps/bot/src/features/subscriptions/subscription.scheduler.ts` | Hourly sweep re-charges due auto-renew subs; lapses (and removes from thread) when auto-renew is off or the balance is too low |

The premium space is a **private Discord thread**, not a dedicated channel:
Discord caps channels per guild, so threads let a server host many fanclubs.
Access is granted/revoked via thread membership (`thread.members.add/remove`).
Token moves reuse `TokenBalance` / `TokenHistory` (event types
`subscription_paid`, `subscription_renewal`, `subscription_income`) so a
fanclub is a closed loop inside the existing economy. New Prisma models:
`SubscriptionPlan`, `Subscription`.

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
