# Features

Each feature lives in its own folder and owns its commands, services, types,
embeds, and permission helpers.

Suggested structure:

```txt
features/<feature>/
  <feature>.commands.ts
  <feature>.service.ts
  <feature>.types.ts
  <feature>.embeds.ts
  <feature>.permissions.ts
```

Command handlers stay thin and delegate business logic to the feature service.

See `docs/feature-map.md` for the migration roadmap.
