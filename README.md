# Discord Bot Rewrite

This repository contains a clean rewrite of an existing Discord bot.

The old bot is included only as read-only reference material in:

```txt
legacy/old-bot-readonly/
```

The new implementation lives in:

```txt
apps/bot/
```

## Goals

The goal of this rewrite is to create a clean, maintainable, modern Discord bot with:

- TypeScript
- modular feature architecture
- clear command handling
- clean service layers
- environment-based configuration
- optional Prisma database support
- good documentation for future development
- AI-agent-friendly project structure

## Repository structure

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

## Important

Do not modify:

```txt
legacy/old-bot-readonly/
```

The legacy bot exists only so humans and coding agents can inspect old behavior.

## Setup

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Start development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start production:

```bash
npm start
```

## Environment variables

Create `.env.example` like this:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

DATABASE_URL="file:./dev.db"

NODE_ENV=development
LOG_LEVEL=debug
```

Never commit your real `.env` file.

## Development workflow

1. Pick one old feature from the legacy bot.
2. Add it to `docs/feature-map.md` if missing.
3. Rebuild it cleanly inside `apps/bot/src/features/`.
4. Add or update slash commands.
5. Test the feature.
6. Update documentation.

## Documentation

Important docs:

```txt
docs/architecture.md
docs/feature-map.md
docs/migration-notes.md
AGENTS.md
```

## Migration strategy

This is not a direct copy of the old bot.

The old bot is used to understand behavior. The new bot should be cleaner, safer, easier to extend, and easier to maintain.
