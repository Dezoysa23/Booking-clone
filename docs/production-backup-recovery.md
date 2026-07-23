# Pearlora — Production Backup & Recovery Runbook

Owner: _(assign a name)_ · Last reviewed: **2026-07-22** · Review cadence: monthly

This runbook covers backup, point-in-time recovery (PITR), off-site copies, restore
testing, and database migration deployment for Pearlora.

**Stack:** Next.js on Vercel · Prisma ORM · **Neon PostgreSQL** (currently **Free** plan).

> ⚠️ **Never run destructive database commands against production.** In particular,
> `prisma migrate reset`, `prisma db push --force-reset`, and manual `DROP`/`TRUNCATE`
> are prohibited on the production branch. Recovery is done by **restoring**, never by
> resetting.

---

## 1. What protects the data today

| Layer | Status | Notes |
|---|---|---|
| Neon automatic history / restore | ⚠️ Limited (Free plan) | Short restore window — **verify + extend** (§2). |
| Off-site / cross-provider dump | ❌ Not set up | Add `pg_dump` job (§4). |
| Restore testing | ❌ Not done | Adopt monthly test (§5). |
| Migration history | ⚠️ Drifted | Reconcile before relying on `migrate deploy` (§7). |

---

## 2. Point-in-Time Recovery (PITR) — enable & verify on Neon

Neon keeps a continuous change history and lets you **restore** the database (or a
branch) to any moment inside the **history-retention window**.

**Enable / check retention:**
1. Neon Console → your project → **Settings → Storage** (a.k.a. *History retention*).
2. Read the current retention window. On the **Free** plan this window is short
   (historically ~6 hours up to ~1 day — confirm the value shown for your project).
   Paid plans (Launch/Scale) allow much longer (up to ~30 days).
3. Set retention to the **maximum your plan allows**. Longer retention = you can recover
   from incidents discovered later (e.g., a bad deploy noticed the next morning).
4. If the Free window is too short for your risk tolerance, either **upgrade the Neon
   plan** for longer PITR, and/or rely on the off-site dumps in §4 for older recovery
   points.

**Recommended backup frequency:**
- PITR is continuous (no schedule needed) within the retention window.
- Off-site logical dumps (§4): **daily**, retained **30 days**; plus **weekly** dumps
  retained **90 days**. Because Free-plan PITR only covers a short window, the daily
  off-site dump is your real safety net for anything older.

---

## 3. How to restore to a point in time (Neon)

Do this **non-destructively** — restore into a new branch first, verify, then promote.

1. Neon Console → **Branches → Restore** (or *Time Travel*).
2. Choose the source branch (`main`/production) and the **target timestamp** (just
   before the incident).
3. Restore into a **new branch** (e.g. `restore-2026-07-22`). This does not touch prod.
4. Point a scratch/staging `DATABASE_URL` at the new branch and run the
   **verification checklist** (§6).
5. Once verified, either:
   - promote the restored branch to be the primary, **or**
   - copy the good data back into production, **or**
   - repoint the app's `DATABASE_URL`/`DIRECT_URL` to the restored branch and redeploy.
6. Update Vercel env vars if the connection string changed, then redeploy.

---

## 4. Off-site / cross-region backup (logical dumps)

Neon data lives in one region. Keep **independent** copies elsewhere so a
project-level or account-level problem can't take out both.

**Create a dump (read-only, safe to run anytime).** Use the **direct** (non-pooled)
connection string, not the pooled one:

```bash
# custom-format dump (compressed, restore-selective)
pg_dump "$DIRECT_URL" -Fc -f "pearlora-$(date +%F).dump"

# OR plain SQL
pg_dump "$DIRECT_URL" -f "pearlora-$(date +%F).sql"
```

**Store off-site:**
- Upload to object storage in a **different provider or region** (e.g. Cloudflare R2,
  Backblaze B2, AWS S3 in another region).
- **Encrypt at rest** and require MFA to access the bucket.
- **Never** commit dumps to git and never place them under `public/`.

**Automate:** run the dump daily from a trusted machine or CI job (GitHub Actions with
`DIRECT_URL` as a secret). Keep it **out** of the public web app.

**Restore a dump into a scratch database:**
```bash
# custom-format
pg_restore --no-owner --dbname "$SCRATCH_DATABASE_URL" pearlora-YYYY-MM-DD.dump
# plain SQL
psql "$SCRATCH_DATABASE_URL" -f pearlora-YYYY-MM-DD.sql
```
Restore into a **scratch DB or Neon branch — never into production** during a test.

---

## 5. Monthly restore test (prove backups actually work)

A backup you haven't restored is a hope, not a backup. Once a month:

1. Create an isolated target: a **new Neon branch** (fast) **or** a scratch database.
2. Restore into it — either PITR (§3) or the latest off-site dump (§4).
3. Run the **verification checklist** (§6) against it.
4. Boot the app against the scratch target (`DATABASE_URL`/`DIRECT_URL` = scratch) and
   smoke-test: log in, list properties, create a test booking.
5. Record the result (date, method, restore duration, pass/fail, issues) in the log (§9).
6. **Delete the scratch branch/database** when done to control cost.

---

## 6. Post-restore verification checklist

- [ ] All tables present: `User`, `Property`, `Booking`, `Subscription`,
      `SubscriptionPlan`, `Payment`, `UserSession`, `NearbyHighlight`,
      `UserPropertyPhoto`.
- [ ] Row counts are within expected range of production (spot-check a few tables).
- [ ] Newest rows look current: `SELECT max("createdAt") FROM "Booking";` etc.
- [ ] Referential integrity holds (no orphaned `Booking.propertyId`, etc.).
- [ ] `_prisma_migrations` table is present and consistent (see §7).
- [ ] App connects and boots against the restored target.
- [ ] Auth works (a known user can log in) and a booking can be created.
- [ ] No secrets or env values were captured in the dump/logs.

---

## 7. Database migration deployment

**Rules**
- Production deploys apply migrations with **`prisma migrate deploy`** only.
- **Never** use `prisma migrate dev`, `prisma migrate reset`, or `prisma db push` against
  production — those can drop/recreate data.
- `prisma generate` now runs automatically via the **`postinstall`** script, so the
  deployed client always matches the schema.

**Deploy flow (Vercel):**
1. `npm install` → triggers `postinstall` → `prisma generate`.
2. Apply migrations (run once per deploy, e.g. a CI step or Vercel build/deploy hook):
   ```bash
   npm run db:migrate:deploy   # = prisma migrate deploy  (uses DIRECT_URL)
   ```
3. `next build` → deploy.

**⚠️ Known issue — migration drift (reconcile before trusting `migrate deploy`):**
The committed migrations only cover `User`/`Property`/`Booking`; the rest of the schema
(`Subscription`, `Payment`, `UserSession`, `NearbyHighlight`, `UserPropertyPhoto`, added
enums/columns) was applied to the live DB via `db push`. So `prisma migrate deploy`
**would not reproduce the current schema** on a fresh database.

Reconcile **without resetting** — generate a migration that captures the drift:
```bash
# Preview the SQL gap between the last migration and the current schema (no changes made):
npx prisma migrate diff \
  --from-migrations ./prisma/migrations \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script

# When it looks correct, create the migration WITHOUT applying it to prod:
npx prisma migrate dev --name reconcile_drift --create-only
# Review the generated SQL, then apply it to production via:
npm run db:migrate:deploy
```
Because the tables already exist in production, you may need to mark the reconciling
migration as already-applied there with `prisma migrate resolve --applied <migration>`
(baseline) so `migrate deploy` doesn't try to re-create existing objects. **Test this on
a Neon branch first (§5) before touching production.**

---

## 8. Emergency recovery — quick steps

1. **Declare + freeze:** note the time; if data is being corrupted, put the app in
   maintenance / stop writes (pause deploys, disable the affected feature).
2. **Pinpoint** the last-known-good timestamp (before the bad deploy/action).
3. **Restore into a new branch** at that timestamp (§3) — never overwrite prod blind.
4. **Verify** the branch (§6).
5. **Cut over:** repoint `DATABASE_URL`/`DIRECT_URL` (Vercel env) to the restored branch
   (or promote it), then redeploy.
6. **Rotate secrets** if the incident involved exposure: `SESSION_SECRET`, `CRON_SECRET`,
   `PAYMENT_WEBHOOK_SECRET`, `RESEND_API_KEY`, Upstash tokens, DB credentials.
7. **Post-mortem:** record cause, timeline, data loss window, and follow-ups in §9.

---

## 9. Access control & log

**Who should have access to backups & the database**
- Neon Console (prod project): leads only, least privilege, MFA required.
- Off-site backup bucket: separate credentials, MFA, encrypted, access logged.
- Production env vars (Vercel): restricted; secrets never printed in logs or shared in chat.
- All DB/backup secrets live only in environment variables (see `.env.example`), never in git.

**Restore-test log**

| Date | Method (PITR / dump) | Target | Duration | Result | Notes |
|---|---|---|---|---|---|
| _2026-07-…_ | | | | | |

---

## 10. Related config

- `.env.example` — canonical list of required env vars (DB, `SESSION_SECRET`,
  `RESEND_*`, `CRON_SECRET`, `PAYMENT_WEBHOOK_SECRET`, `UPSTASH_*`).
- `package.json` scripts — `postinstall` (`prisma generate`), `db:migrate:deploy`,
  `db:seed` (⚠️ `prisma/seed.ts` deletes bookings & properties before seeding — **dev
  only**, never run against production).
