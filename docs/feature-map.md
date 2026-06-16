# Feature Map

This document tracks which old bot features exist, where they were located, and how they are being rebuilt in the new bot.

Update this file whenever a feature is migrated, changed, skipped, or redesigned.

## Status values

Use these status values:

| Status | Meaning |
|---|---|
| Not reviewed | Feature exists or may exist in legacy code, but has not been inspected yet |
| Planned | Feature should be rebuilt |
| In progress | Feature is currently being rebuilt |
| Migrated | Feature has been rebuilt in the new bot |
| Changed | Feature was rebuilt with changed behavior |
| Skipped | Feature will not be migrated |
| Replaced | Feature was replaced by a different implementation |

## Feature map

| Old Feature | Old Location | Status | New Location | Notes |
|---|---|---|---|---|
| Bot startup | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/index.ts` | Rebuild clean startup and logging |
| Command handling | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/commands/` | Prefer slash commands |
| Event handling | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/events/` | Rebuild with typed event handlers |
| Role management | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/services/role.service.ts` | Check hierarchy and permission behavior |
| Permission checks | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/services/permission.service.ts` | Centralize permission logic |
| Logging | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/lib/logger.ts` | Use structured logs |
| Configuration | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/config/` | Replace old config with env-based config |
| Error handling | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/lib/errors.ts` | User-friendly replies, internal logs |
| Database usage | `legacy/old-bot-readonly/` | Not reviewed | `prisma/schema.prisma` | Review old data model before recreating |
| Admin commands | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/admin/` | Rebuild with strict permissions |
| User commands | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/user/` | Review what should remain |
| Verification | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/verification/` | Rebuild cleanly if still needed |
| Welcome / onboarding | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/onboarding/` | Optional |
| Moderation | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/moderation/` | Optional |
| Utility commands | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/utility/` | Keep only useful commands |
| Scheduled jobs | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/services/scheduler.service.ts` | Optional |
| Webhooks | `legacy/old-bot-readonly/` | Not reviewed | `apps/bot/src/features/webhooks/` | Check security before migrating |

## Migration notes per feature

### Bot startup

Old behavior:

```txt
TODO: Describe old startup behavior.
```

New behavior:

```txt
TODO: Describe new startup behavior.
```

Decision:

```txt
TODO: Preserve, improve, replace, or skip.
```

---

### Command handling

Old behavior:

```txt
TODO: Describe old command system.
```

New behavior:

```txt
Slash commands are preferred.
```

Decision:

```txt
TODO.
```

---

### Role management

Old behavior:

```txt
TODO.
```

New behavior:

```txt
Centralized role service with permission checks.
```

Decision:

```txt
TODO.
```

---

### Verification

Old behavior:

```txt
TODO.
```

New behavior:

```txt
TODO.
```

Decision:

```txt
TODO.
```

## How to use this file with AI agents

Example prompt:

```txt
Inspect the old implementation of role management in legacy/old-bot-readonly.
Rebuild it cleanly in apps/bot/src/services/role.service.ts.
Update docs/feature-map.md after migration.
Do not modify the legacy folder.
```
