# AGENTS.md

This repository is a full rewrite of an existing Discord bot.

The old bot code exists only as reference material. The new bot must be built cleanly, with modern architecture, clear separation of concerns, and maintainable TypeScript code.

## Core rule

Do not modify files inside:

```txt
legacy/old-bot-readonly/
```

The legacy folder is read-only reference code.

Use it to understand:
- old command behavior
- existing feature logic
- permission checks
- database assumptions
- message formats
- edge cases
- user flows

But do not copy old code blindly. Rebuild features cleanly.

## Target structure

```txt
apps/
  bot/
    src/
      commands/
      events/
      features/
      services/
      lib/
      config/
      index.ts

packages/
  shared/
    src/

prisma/
  schema.prisma
  migrations/

docs/
  architecture.md
  feature-map.md
  migration-notes.md

legacy/
  old-bot-readonly/
```

## Development principles

Use:
- TypeScript
- strict typing
- modular feature folders
- clear service layers
- environment-based configuration
- Prisma for database access, if database features are needed
- slash commands where possible
- readable names over clever abstractions

Avoid:
- hardcoded secrets
- global spaghetti state
- large all-in-one command files
- direct database calls inside command handlers
- silent error swallowing
- copying legacy code without refactoring
- mixing unrelated features in one folder

## Secrets and environment variables

Never commit secrets.

Allowed:

```txt
.env.example
```

Not allowed:

```txt
.env
.env.local
config.json with tokens
database dumps with real user data
logs containing tokens
```

Before using legacy code, check it for:
- Discord tokens
- bot client secrets
- webhook URLs
- API keys
- database URLs
- passwords
- private user data

If a secret was ever committed in the old repo, assume it is compromised and rotate it.

## Feature migration workflow

When migrating a feature:

1. Inspect the old implementation in `legacy/old-bot-readonly/`.
2. Understand the user-facing behavior.
3. Check if the old behavior should be preserved, simplified, or improved.
4. Rebuild the feature inside `apps/bot/src/features/`.
5. Add or update command handlers in `apps/bot/src/commands/`.
6. Move reusable logic into services.
7. Update `docs/feature-map.md`.
8. Add notes to `docs/migration-notes.md` if behavior changed.

## Preferred feature structure

Example:

```txt
apps/bot/src/features/verification/
  verification.commands.ts
  verification.service.ts
  verification.types.ts
  verification.embeds.ts
  verification.permissions.ts
```

Command handlers should stay thin.

Good:

```ts
await verificationService.startVerification(interaction.user.id);
```

Bad:

```ts
// 300 lines of database, permission, embed, and business logic inside one command file
```

## Error handling

All user-facing errors should be clear and friendly.

Do not expose:
- stack traces
- raw database errors
- internal config names
- secret values

Log technical details internally.

## Permissions

Always check:
- Discord permissions
- role hierarchy
- guild context
- bot permissions
- whether a command is allowed in DMs
- whether the user is authorized to perform admin actions

## Database rules

If using Prisma:
- Keep schema changes intentional.
- Use migrations.
- Do not manually edit migration history unless explicitly instructed.
- Avoid storing unnecessary personal data.
- Store only what the bot needs.

## Documentation rules

Keep these files updated:

```txt
docs/feature-map.md
docs/migration-notes.md
docs/architecture.md
```

Whenever a feature is migrated, update the feature map.

Whenever behavior changes compared to the old bot, write it down in migration notes.

## Coding style

Use:
- descriptive names
- small functions
- explicit return types for services
- typed config objects
- clear folder boundaries

Prefer:

```ts
getRequiredEnv("DISCORD_TOKEN")
```

Over:

```ts
process.env.DISCORD_TOKEN!
```

## Commands

Prefer slash commands.

Command files should mainly:
- validate input
- call services
- return responses

Business logic belongs in services.

## Legacy compatibility

The new bot does not need to preserve bad internal structure from the old bot.

Preserve:
- useful behavior
- important user flows
- existing community expectations
- role logic, if still relevant

Improve:
- architecture
- error handling
- security
- config handling
- command naming
- database structure

## Agent instruction summary

When asked to implement something:

1. Look for old behavior in `legacy/old-bot-readonly/`.
2. Rebuild it cleanly in the new architecture.
3. Do not edit legacy files.
4. Update documentation.
5. Keep code modular and typed.
6. Ask only if the requested behavior is truly ambiguous.
