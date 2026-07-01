# Deployment (Railway)

This document describes how to run the bot on Railway with a managed
Postgres database, so the schema is created automatically and stays up to
date on every deploy, and slash commands are (re-)registered automatically.

## 1. Add a Postgres database

In the Railway project, click **New** → **Database** → **Add PostgreSQL**.
Railway provisions the database and exposes a `DATABASE_URL` variable on
that service.

## 2. Wire `DATABASE_URL` into the bot service

On the bot service's **Variables** tab, add `DATABASE_URL` as a reference to
the Postgres service, e.g.:

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Do not hardcode the connection string — referencing the Postgres service
keeps it in sync if Railway ever rotates credentials or the host changes.

## 3. Required environment variables

Set these on the bot service (see `.env.example` for the full list):

```txt
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
DISCORD_GUILD_ID=...      # recommended for production, see below
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
LOG_LEVEL=info
```

`DISCORD_GUILD_ID` is optional, but strongly recommended even in
production: guild-scoped command registration propagates instantly, while
global registration (no `DISCORD_GUILD_ID` set) can take up to an hour to
show up in Discord. If slash commands "aren't showing up" right after a
deploy, this is the most common cause — check the Discord client again
after global propagation finishes, or scope to a guild for instant
feedback.

## 4. Build and start commands

Railway's default Railpack builder auto-detects the `npm run build` /
`npm start` scripts in `package.json`, so no custom build/start commands
need to be configured in the Railway dashboard. For clarity, `railway.json`
in the repo root also declares them explicitly (`build.builder: "RAILPACK"`).

What each step does:

- **Install**: `npm ci` runs `postinstall`, which runs `prisma generate` so
  the generated Prisma client exists before the TypeScript build compiles
  code that imports `@prisma/client`.
- **Build**: `npm run build` compiles `apps/`, `packages/`, and `prisma/`
  TypeScript to `dist/`.
- **Start**: `npm start` runs, in order:
  1. `prisma migrate deploy` — applies any migrations in
     `prisma/migrations/` that haven't been applied to the target database
     yet. This is what creates the tables on a brand-new Railway Postgres
     database, and keeps the schema current on every subsequent deploy. It
     never generates new migrations and never resets data.
  2. `node dist/apps/bot/src/scripts/deploy-commands.js` — registers the
     current slash command set with Discord. Running this on every start is
     safe: it's an idempotent `PUT` of the full command list, not an
     incremental change.
  3. `node dist/apps/bot/src/index.js` — starts the bot.

If step 1 or 2 fails, the process exits before the bot logs in, so a bad
migration or an invalid Discord token surfaces as a failed deploy rather
than a bot that's silently missing tables or commands.

## 5. Adding new database changes

Never hand-edit `prisma/migrations/`. To change the schema:

```bash
# locally, against a dev database
npm run prisma:migrate -- --name <describe_the_change>
```

Commit the generated migration folder. The next Railway deploy applies it
automatically via `prisma migrate deploy` in the start command — no manual
step required.

## 6. Verifying after a deploy

- Check the deploy logs for `prisma migrate deploy` output (it lists any
  migrations it applied, or says the database is already up to date), then
  a "Deployed slash commands" log line, then "Starting bot".
- In Discord, re-open the slash command picker (or restart the client) if
  commands don't show up immediately after a global (non-guild-scoped)
  deploy.
