# Architecture

This document describes the intended architecture for the Discord bot rewrite.

## Purpose

The new bot is a clean rewrite of an existing Discord bot.

The old implementation is available in:

```txt
legacy/old-bot-readonly/
```

The new implementation lives in:

```txt
apps/bot/
```

The rewrite should preserve valuable behavior, but not legacy architecture problems.

## Domain overview

ToyControlBot controls Lovense toys from within a Discord guild. The main
domains are Lovense control sessions, a token economy (daily tokens, balances,
toplist, tipping), shared control-link raffles, and button-driven dashboards.
See `docs/feature-map.md` for the full migration roadmap and `docs/migration-notes.md`
for decisions and risks (including rotating the Lovense API tokens that were
committed in the legacy config).

## Current scaffold

The foundation is in place under `apps/bot/src/`:

- `index.ts` — entrypoint: builds the client, registers events, logs in,
  installs shutdown handlers that disconnect the database cleanly.
- `config/` — typed, validated, env-based configuration.
- `lib/` — `env`, `logger` (pino), `client` (intents), `errors`.
- `events/` — typed event registry with `ready` and `interactionCreate`
  (dispatches slash commands and button interactions).
- `commands/` — typed slash-command registry, populated per feature.
- `buttons/` — typed button-handler registry, mirrors the command registry
  for interactive components (e.g. toplist pagination).
- `services/` — `database.service.ts` (Prisma client) and
  `permission.service.ts` (guild-context + role checks).
- `features/economy/` — the first migrated feature: daily token, balance,
  toplist.
- `scripts/deploy-commands.ts` — registers slash commands with Discord
  (`npm run deploy-commands`), replacing the legacy `!deploy-*` chat commands.

## Design goals

The new bot should be:

- modular
- easy to understand
- easy to extend
- safe with secrets
- compatible with AI coding agents
- maintainable long-term
- structured around features, not random utility files

## High-level structure

```txt
apps/bot/src/
  commands/
  events/
  features/
  services/
  lib/
  config/
  index.ts
```

## Folder responsibilities

### `commands/`

Contains Discord command registration and command entry points.

Command handlers should be thin.

They should:
- validate command input
- check basic interaction context
- call feature services
- reply to the user

They should not:
- contain large business logic
- directly manipulate complex database models
- duplicate permission logic
- contain large embed construction logic

### `events/`

Contains Discord event handlers.

Examples:
- ready event
- interactionCreate event
- guildCreate event
- error event
- member join event

Event handlers should call services where needed.

### `features/`

Contains feature-specific modules.

Example:

```txt
features/
  verification/
    verification.commands.ts
    verification.service.ts
    verification.types.ts
    verification.embeds.ts
    verification.permissions.ts
```

A feature folder may contain:
- command logic
- service logic
- types
- embeds
- permission helpers
- feature-specific utilities

### `services/`

Contains cross-feature services.

Examples:
- role service
- logging service
- guild settings service
- user service
- audit service
- database service

If something is used by several features, it belongs in `services/`.

### `lib/`

Contains low-level helpers.

Examples:
- logger setup
- environment helpers
- error helpers
- Discord client setup
- formatting helpers

### `config/`

Contains typed configuration loading.

Example:

```ts
export const config = {
  discordToken: getRequiredEnv("DISCORD_TOKEN"),
  clientId: getRequiredEnv("DISCORD_CLIENT_ID"),
  guildId: process.env.DISCORD_GUILD_ID,
};
```

## Suggested feature pattern

Each feature should follow this pattern where possible:

```txt
features/example/
  example.commands.ts
  example.service.ts
  example.types.ts
  example.embeds.ts
  example.permissions.ts
```

## Command pattern

Command handlers should be small.

Example:

```ts
export async function handleExampleCommand(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const result = await exampleService.run({
    userId: interaction.user.id,
    guildId: interaction.guildId,
  });

  await interaction.editReply(result.message);
}
```

## Service pattern

Services should contain the actual business logic.

Example:

```ts
export async function runExampleService(input: ExampleInput): Promise<ExampleResult> {
  // Validate
  // Load data
  // Apply business rules
  // Save result
  // Return clean output
}
```

## Database access

If using Prisma, database access should be handled through services.

Avoid direct Prisma calls inside command handlers.

Good:

```ts
await guildSettingsService.getSettings(guildId);
```

Bad:

```ts
await prisma.guildSettings.findUnique(...);
```

## Error handling

Errors should be handled in layers.

### User-facing errors

These should be friendly and understandable.

Example:

```txt
You do not have permission to use this command.
```

### Internal errors

These should be logged with technical detail.

Example:

```txt
Failed to assign role because the bot role is below the target role.
```

Do not expose internal stack traces to Discord users.

## Permissions

Permission checks should be explicit.

Always consider:
- Is this command guild-only?
- Can it be used in DMs?
- Does the user need a role?
- Does the user need a Discord permission?
- Does the bot have permission?
- Is the bot role high enough?
- Is the command restricted to admins or moderators?

## Logging

Use structured logging where possible.

Log:
- startup
- command errors
- failed permission operations
- migration steps
- important admin actions

Avoid logging:
- tokens
- secrets
- unnecessary personal data
- full private messages unless absolutely required

## Legacy folder

The legacy bot is stored in:

```txt
legacy/old-bot-readonly/
```

Rules:
- do not edit it
- do not import from it
- do not depend on it at runtime
- only inspect it during migration

## AI agent workflow

When using Codex, Claude, Cursor, or other AI coding tools, give tasks like:

```txt
Check the old implementation in legacy/old-bot-readonly.
Rebuild the feature cleanly in apps/bot/src/features.
Do not edit the legacy folder.
Update docs/feature-map.md after migration.
```

## Long-term target

The finished rewrite should make it easy to add:

- new slash commands
- database-backed user settings
- guild-specific configuration
- role automation
- moderation features
- verification systems
- dashboards
- Twitch or web integrations, if needed later
