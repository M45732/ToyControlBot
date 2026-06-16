# Services

Cross-feature services live here — logic used by more than one feature, such as
database access, guild settings, permission checks, and token/economy
accounting.

Anything used by a single feature belongs in that feature folder instead.

Database access (Prisma) should be wrapped by services; command handlers must
not call the database directly.
