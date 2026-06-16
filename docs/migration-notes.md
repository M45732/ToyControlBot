# Migration Notes

This document tracks important decisions, behavior changes, skipped legacy features, and migration risks during the bot rewrite.

## Migration principle

The new bot is not a line-by-line rewrite.

The legacy bot is used to understand existing behavior, but the new bot should be cleaner, safer, and easier to maintain.

## Global decisions

| Date | Decision | Reason |
|---|---|---|
| TODO | Start clean rewrite in new repo | Avoid carrying old architecture problems into the new bot |
| TODO | Keep legacy code read-only | Allows reference without polluting new architecture |
| TODO | Prefer slash commands | Modern Discord bot interaction model |
| TODO | Use TypeScript | Better maintainability and safer refactoring |
| TODO | Use environment variables | Avoid hardcoded secrets |
| TODO | Centralize permissions | Avoid inconsistent access control |

## Behavior changes

Document behavior changes here.

| Feature | Old Behavior | New Behavior | Reason |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

## Skipped legacy features

Document features that should not be migrated.

| Feature | Old Location | Reason for skipping |
|---|---|---|
| TODO | TODO | TODO |

## Replaced legacy features

Document features that were replaced by a better implementation.

| Old Feature | New Feature | Reason |
|---|---|---|
| TODO | TODO | TODO |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Old secrets committed in legacy code | Tokens or keys may be compromised | Search legacy code and rotate exposed secrets |
| Old behavior unclear | Feature may be rebuilt incorrectly | Document old behavior before rewriting |
| Permissions differ from old bot | Users may gain or lose access unexpectedly | Centralize and test permission checks |
| Database model differs | Existing data may not migrate cleanly | Create explicit migration plan |
| Commands renamed | Users may be confused | Document command changes and provide transition notes |

## Secret cleanup checklist

Before committing legacy code into this repository, check for:

- [ ] Discord bot token
- [ ] Discord client secret
- [ ] API keys
- [ ] webhook URLs
- [ ] database URLs
- [ ] passwords
- [ ] `.env` files
- [ ] config files with secrets
- [ ] logs containing tokens
- [ ] exported user data
- [ ] database dumps

If any secret is found, rotate it.

## Legacy import rule

The new bot must never import runtime code from:

```txt
legacy/old-bot-readonly/
```

The legacy folder is documentation by example, not a dependency.

## Migration workflow

For each feature:

1. Locate old implementation.
2. Describe old behavior in `docs/feature-map.md`.
3. Decide whether to preserve, improve, replace, or skip.
4. Implement new version.
5. Test manually.
6. Update `docs/feature-map.md`.
7. Add behavior changes here if needed.

## Open questions

| Question | Decision needed |
|---|---|
| Which old commands are still needed? | TODO |
| Should the bot use one database per environment? | TODO |
| Should commands be guild-only during development? | TODO |
| Should old prefix commands be supported temporarily? | TODO |
| Which features require admin-only access? | TODO |
