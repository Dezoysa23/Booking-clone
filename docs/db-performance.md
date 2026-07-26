# Pearlora — Database Performance: Recommended Indexes

_Status: schema updated; **nothing applied to the database** by this change. Apply the migration
deliberately (see below) after checking migration drift._

The existing schema is already well-indexed (see
[production-readiness-checklist.md](./production-readiness-checklist.md) §3). This adds three
**additive, non-destructive** indexes justified by real query patterns, plus one optional
extension-based index for fuzzy location search.

## Indexes added to `schema.prisma`

| Index | Serves | Why |
|-------|--------|-----|
| `Booking(propertyId, checkIn, checkOut)` | `assertPropertyAvailable` overlap query ([lib/bookings/availability.ts](../lib/bookings/availability.ts)) | Runs inside the SERIALIZABLE transaction on **every booking attempt**; filters `propertyId` + `checkIn < :out` + `checkOut > :in`. Highest-value index here. |
| `Payment(createdAt)` | `GET /api/super-admin/payments` | `findMany({ orderBy: { createdAt: "desc" } })` — index-ordered scan avoids a full sort. |
| `Subscription(createdAt)` | `GET /api/super-admin/subscriptions` | Same `orderBy: createdAt desc`. |

All three are `CREATE INDEX` only — **no drops, no column/type changes, no data migration.**
`@@index` does not change the generated Prisma Client, so application code and types are unchanged.

The SQL lives in [prisma/sql/add-performance-indexes.sql](../prisma/sql/add-performance-indexes.sql)
(idempotent `IF NOT EXISTS`, names matching Prisma's convention).

## ⚠️ Before applying — migration drift
This project has **known Prisma migration drift** (local history vs. the Neon DB). Do **not** run
`prisma migrate dev`/`deploy` blindly. First:
```bash
npx prisma migrate status      # inspect applied vs pending + drift
```
Then choose an apply path:

- **Option A — Prisma migration (preferred once drift is reconciled):**
  ```bash
  npx prisma migrate dev --name add_performance_indexes   # generates the migration from the schema
  ```
  Only do this after `migrate status` is clean, or it may try to reset/reconcile prior migrations.

- **Option B — direct apply (get the benefit now, bypass migration history):**
  ```bash
  npx prisma db execute --file prisma/sql/add-performance-indexes.sql --schema prisma/schema.prisma
  ```
  Applies the idempotent SQL straight to the DB. Because the statements are `IF NOT EXISTS`, this is
  safe and repeatable; it does not touch `_prisma_migrations`. Reconcile Prisma history separately.

- **Option C — psql (needed for the `CONCURRENTLY` variant on large tables):**
  ```bash
  psql "$DIRECT_URL" -f prisma/sql/add-performance-indexes.sql
  ```

Take a `pg_dump` first if you want a restore point (see [rollback-strategy.md](./rollback-strategy.md)).
Index creation on the current (small) dataset is effectively instant; the `CONCURRENTLY` variant in
the SQL file matters only once these tables grow large.

## Rollback
Dropping an index is safe and loses no data:
```sql
DROP INDEX IF EXISTS "Booking_propertyId_checkIn_checkOut_idx";
DROP INDEX IF EXISTS "Payment_createdAt_idx";
DROP INDEX IF EXISTS "Subscription_createdAt_idx";
```

## Optional / future

- **`Property.location` fuzzy search** — `/results` filters with `contains` (ILIKE `%term%`), which a
  B-tree can't accelerate. A trigram GIN index helps at scale but needs the `pg_trgm` extension
  (commented in the SQL file). Left out of `schema.prisma` because Prisma-managed extension indexes
  need preview features; apply manually if/when search latency matters.
- **Unbounded admin reads** — `super-admin/payments` and `super-admin/subscriptions` fetch **all**
  rows with no pagination. The `createdAt` indexes help the sort, but add `skip`/`take` pagination
  (as `super-admin/users` already does) before these tables get large. This is an API-shape change,
  so it's deferred, not done here.
- **Redundant index note** — `Booking(propertyId)` is now a leftmost-prefix subset of
  `Booking(propertyId, checkIn, checkOut)`. It can optionally be dropped later to save write
  overhead; kept for now to keep this change strictly additive.
