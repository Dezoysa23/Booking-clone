# Pearlora — Rollback & Recovery Strategy

_Environment: Vercel (hosting) + Neon (PostgreSQL). Default branch: `main`._

The goal: any change can be reversed quickly and safely, and data can be recovered. Ordered from
fastest/safest to most involved.

---

## 1. Instant deployment rollback (Vercel) — fastest, no code change
Use when a deploy is broken but the database schema is unchanged.
1. Vercel Dashboard → Project → **Deployments**.
2. Find the last known-good deployment → **⋯ → Promote to Production** (a.k.a. Instant Rollback).
3. Production traffic switches back in seconds; no rebuild.

> Instant rollback only reverts **code/build**, not database migrations. If the bad deploy ran a
> destructive migration, also follow §3/§4.

---

## 2. Git rollback (source of truth)
- **Revert a specific commit** (safe, keeps history):
  ```bash
  git revert <sha>          # creates an inverse commit
  git push origin main
  ```
- **Roll back a range** (e.g. a whole feature): `git revert <oldest>^..<newest>`.
- **Undo a bad merge to main** (only if not yet relied upon downstream):
  ```bash
  git revert -m 1 <merge-sha>
  ```
- ⚠️ Do **not** `git reset --hard` / force-push shared branches. Prefer `revert`.
- The luxury-botanical UI redesign is a linear fast-forward on `main`; to revert the whole UI,
  revert the range `3177c65..<tip>` (Phase-1 redesign commit onward).

---

## 3. Prisma migration rollback
Prisma has no automatic "down" migrations. To reverse a schema change:
1. Write a **new** migration that undoes the change (add the reverse SQL), or restore from backup (§4).
2. Apply with `prisma migrate deploy`.
3. ⚠️ **Known issue:** this project has migration drift between local history and the Neon DB.
   Reconcile **before** running `migrate deploy` in production, or `migrate deploy` may fail or
   attempt unexpected changes. Use `prisma migrate status` first; consider `prisma db pull` to
   inspect the live schema.
4. Never run `prisma migrate reset` against production (it drops all data).
5. Additive migrations (new nullable columns, new indexes) are low-risk and easy to reverse;
   destructive ones (drop column/table, type changes) require a backup first.

---

## 4. Database backup & restore (Neon)
- **Current posture:** Neon **Free** tier — Point-in-Time Recovery (PITR) is **not** configured.
  This is the biggest recovery gap.
- **Recommended:** enable a paid Neon plan for PITR/history retention, or take scheduled logical
  backups:
  ```bash
  pg_dump "$DIRECT_URL" -Fc -f pearlora_$(date +%F).dump   # scheduled (cron/GitHub Action)
  pg_restore --clean --if-exists -d "$DIRECT_URL" pearlora_YYYY-MM-DD.dump   # restore
  ```
- Neon **branching** can create an instant copy of the DB to test a risky migration/restore
  before touching production.
- Before any destructive migration or bulk data operation: **take a `pg_dump` first.**

---

## 5. Feature flags / kill switches (env-driven, no redeploy of code logic)
Prefer env vars so a feature can be disabled by changing a Vercel env value + redeploy (or instant
rollback), without a code change:
- **Rate limiting** — if a misconfigured limit blocks real users, the limiter is in-memory and
  per-route; the fastest mitigation is to **raise the limit constant** and redeploy, or Vercel
  instant-rollback to the pre-change deploy. (Consider gating limits behind `RATE_LIMIT_ENABLED`
  if you want a true kill switch.)
- **Cron** — unset/rotate `CRON_SECRET` to disable the reminder endpoint (it fails closed).
- **Payment webhook** — unset `PAYMENT_WEBHOOK_SECRET` to reject all webhooks (fails closed).
- **Future AI/RAG** — must ship behind `AI_ENABLED` (default off). If retrieval/generation
  misbehaves, set `AI_ENABLED=false` to fall back to non-AI UX with zero code change.

---

## 6. UI rollback
The current UI is the "luxury botanical" redesign merged to `main`. To restore the previous look
without losing backend work, `git revert` the redesign commit range (§2) — backend files were not
touched by the redesign, so a UI-only revert is clean.

---

## 7. Incident quick-reference
| Symptom | First action |
|---------|--------------|
| Site broken after deploy, DB unchanged | Vercel **Instant Rollback** (§1) |
| Bad code merged, schema unchanged | `git revert` + push (§2) |
| Bad migration | Reverse migration or restore backup (§3/§4) |
| Data loss/corruption | Restore `pg_dump` / Neon branch (§4) |
| Rate limit blocking users | Raise limit + redeploy, or instant-rollback (§5) |
| Webhook/cron abused | Rotate/unset the secret (§5) |

---

## 8. Pre-deploy checklist
- [ ] `npx tsc --noEmit` · `npm run lint` · `npm run build` all green.
- [ ] Vercel env vars set: `DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `CRON_SECRET`,
      `PAYMENT_WEBHOOK_SECRET`, email (`RESEND_*` or `GMAIL_*`), `NEXT_PUBLIC_BASE_URL`.
- [ ] `prisma migrate status` clean (drift reconciled) before any `migrate deploy`.
- [ ] `pg_dump` taken if the deploy includes a destructive migration.
- [ ] Note the current production deployment ID (the instant-rollback target).
