-- Pearlora performance indexes — ADDITIVE and NON-DESTRUCTIVE.
-- Idempotent (IF NOT EXISTS) — safe to run more than once. Names match Prisma's
-- @@index naming so a future `prisma migrate` sees no diff. See docs/db-performance.md.
--
-- Apply (pick one; check `prisma migrate status` first — this repo has known drift):
--   A) prisma migrate dev --name add_performance_indexes     (regenerates from schema; needs clean state)
--   B) prisma db execute --file prisma/sql/add-performance-indexes.sql --schema prisma/schema.prisma
--   C) psql "$DIRECT_URL" -f prisma/sql/add-performance-indexes.sql

-- Availability-overlap lookups (assertPropertyAvailable) — hot path on every booking.
CREATE INDEX IF NOT EXISTS "Booking_propertyId_checkIn_checkOut_idx"
  ON "Booking" ("propertyId", "checkIn", "checkOut");

-- Super-admin payments list — ORDER BY createdAt DESC.
CREATE INDEX IF NOT EXISTS "Payment_createdAt_idx"
  ON "Payment" ("createdAt");

-- Super-admin subscriptions list — ORDER BY createdAt DESC.
CREATE INDEX IF NOT EXISTS "Subscription_createdAt_idx"
  ON "Subscription" ("createdAt");

-- ── Optional: fuzzy Property.location search (ILIKE '%term%') ──────────────────
-- Not in schema.prisma (needs the pg_trgm extension). Uncomment to enable:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS "Property_location_trgm_idx"
--   ON "Property" USING gin ("location" gin_trgm_ops);

-- ── Large / busy tables: zero-downtime variant ────────────────────────────────
-- CREATE INDEX CONCURRENTLY cannot run inside a transaction — run each statement
-- individually via psql (NOT via `prisma migrate`/`db execute`), e.g.:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS "Booking_propertyId_checkIn_checkOut_idx"
--   ON "Booking" ("propertyId", "checkIn", "checkOut");
