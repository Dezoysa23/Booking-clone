# Pearlora — Production Readiness Checklist & Audit

_Last audited: 2026-07-25 · Stack: Next.js 16 · React 19 · Prisma 6 · PostgreSQL (Neon) · Vercel_

This document is the result of a full production-readiness audit covering AI/RAG readiness,
security, privacy, database performance, reliability, monitoring, and rollback. It records
**what exists**, **what is a gap**, and **what is only planned** — so future work starts from
facts, not assumptions.

Legend: ✅ Implemented · ⚠️ Gap / partial · 📋 Planned / document-only · 🔒 Needs decision before building

---

## 0. Answers to the scoping questions

| # | Question | Answer (from code) |
|---|----------|--------------------|
| 1 | AI/RAG/document search feature? | **No.** No AI/vector/embedding dependencies, no `lib/ai`/`lib/search`, no document/chunk/embedding/message models. This checklist is for a *potential future* feature. |
| 2 | What data would AI search use? | N/A today. If built: property details, booking policies, host guides, support docs (see `rag-readiness-plan.md`). |
| 3 | AI answer audience? | N/A today. Planned scoping documented in RAG plan. |
| 4 | Vector DB in use? | **None.** Neon Postgres could host `pgvector` later. |
| 5 | Audit only or implement safe fixes? | Audit done; **safe low-risk fixes implemented** (see §Changes). |
| 6 | Production environment? | **Vercel + Neon PostgreSQL.** |
| 7 | Upstash Redis present? | **No** — `rate-limit.ts` is in-memory only; no `@upstash/*` dependency. |
| 8 | Password reset routes? | **None.** Only authenticated change-password + email-verification exist. |
| 9 | Monitoring/logging tools? | **None installed** (no Sentry/Logtail/Axiom/OTel). Vercel platform logs + `console.*` only. |
| 10 | Public cross-origin APIs? | **None.** No CORS headers anywhere; everything is same-origin. Webhook uses signature auth. |

---

## 1. Security & Auth — mostly ✅

### User isolation / UUID locking — ✅
- Session token is `userId.sessionId.HMAC-SHA256(secret)`; the userId is **always derived
  server-side** from the verified cookie ([lib/auth.ts](../lib/auth.ts)). No route trusts a
  client-supplied `userId`.
- `getSessionUserId()` verifies HMAC (timing-safe) **and** re-checks the DB session row
  (not revoked, not expired, userId matches). Fails closed on DB error.
- Ownership enforced on resources:
  - Bookings: `booking.userId !== session userId → 403` ([bookings/[id]](../app/api/bookings/%5Bid%5D/route.ts), cancel).
  - Host properties: `authorizeOwner()` checks role **and** `property.hostId === user.id` (super-admin bypass) ([host/properties/[id]](../app/api/host/properties/%5Bid%5D/route.ts)).
  - Super-admin routes: `requireSuperAdmin` / `isSuperAdmin` gate ([super-admin/users](../app/api/super-admin/users/route.ts)).
- Reusable guards in [lib/security/api-auth.ts](../lib/security/api-auth.ts):
  `requireUserId`, `requireUser`, `requireHostOrAdmin`, `requireSuperAdmin`, `parseIntParam`.
- Server-side session store (`UserSession`) supports revocation; `revokeAllUserSessions()`
  exists for post-password-change invalidation.

### CSRF — ✅
- `verifyCsrfOrigin()` ([lib/security/csrf.ts](../lib/security/csrf.ts)) enforces Origin/Referer
  matches host (https in prod) on state-changing routes. Applied on booking create, cancel,
  property PATCH/DELETE, uploads, subscribe, etc. Webhooks correctly exempt (signature instead).

### Transport & headers — ✅
- [middleware.ts](../middleware.ts): http→https 308 redirect in prod; HSTS (2y, preload);
  CSP (`frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
  `connect-src 'self'`); `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`.
- CSP note: `script-src` still allows `'unsafe-inline' 'unsafe-eval'` for Next hydration —
  nonce-based hardening is a future improvement (⚠️ low priority).

### Input validation — ✅ core / ⚠️ partial elsewhere
- Zod schemas ([lib/validation/schemas.ts](../lib/validation/schemas.ts)) cover login, signup,
  change-password, verify-email, resend-verification, create-booking, update-account.
- Property create/edit, host rules/facilities, uploads use **ad-hoc but real** validation
  (`safeString`, `isValidImagePath`, price/rating ranges, MIME + 5 MB size on uploads).
- ⚠️ Not yet on Zod: nearby-highlights, rooms, availability blocks, user-photos, subscribe
  payload, admin search params. These validate ad-hoc; migrating them to shared Zod schemas is
  a **safe future refactor** (not a security hole today).

### Rate limiting — ✅ improved this pass / ⚠️ platform limit
- [lib/security/rate-limit.ts](../lib/security/rate-limit.ts) sliding-window limiter with XFF
  spoof protection ([get-client-ip.ts](../lib/security/get-client-ip.ts) `isPlausibleIp`).
- Applied to: login, signup, verify-email, resend-verification, change-password, payment webhook.
- **Added this pass:** booking create, image uploads, host subscribe.
- ⚠️ **In-memory = per-serverless-instance on Vercel.** It is not shared across lambdas, so a
  determined attacker across many cold starts gets more attempts than the nominal limit.
  Upgrade path (🔒 needs decision — adds a dependency): Upstash Redis, see §Recommendations.

### CORS — ✅
- No `Access-Control-Allow-Origin` anywhere; all APIs same-origin. Nothing to fix. Keep it this
  way unless a genuine cross-origin consumer appears; if so, use an allow-list from
  `ALLOWED_ORIGINS` env, never `*` on authenticated routes.

### Secrets & dev endpoints — ✅
- `SESSION_SECRET` required in prod (throws if missing). `CRON_SECRET` fail-closed (503).
  `PAYMENT_WEBHOOK_SECRET` fail-closed (401), timing-safe compare.
- `/api/dev/peek-code` returns 404 in production.
- No secrets logged. `.env` is gitignored; [.env.example](../.env.example) documents every var.

---

## 2. Password reset — 📋 (feature does not exist)
There is **no forgot-password / reset flow** — only authenticated change-password and the
email-verification flow (which is already correct: 6-digit code hashed with `codeHash`,
`expiresAt`, single-use `usedAt`). If a reset feature is wanted, build it to this spec:
- Reset token: random 32-byte value; store **only its hash**; `expiresAt` 15–30 min; single-use `usedAt`.
- Rate-limit request + submit; **do not reveal whether an email exists** (always return generic success).
- Revoke previous unused reset tokens when a new one is issued.
- Require strong new password; call `revokeAllUserSessions(userId)` after reset.

_Status: documented design only. Not built — say the word and it's ~1 model + 2 routes + 2 pages._

---

## 3. Database performance — ✅ good / 📋 index recommendations

Existing indexes are solid: `Booking(propertyId, userId, [status,checkIn])`, `Property(hostId)`,
`User.email @unique`, `Subscription(userId,planId)`, `Payment(subscriptionId,userId)`,
`UserSession(userId,sessionId,expiresAt,[userId,isRevoked])`, plus Room / availability / photos.
Pagination + `select` projections already used on heavy admin lists (e.g. super-admin/users).
Booking creation uses a **SERIALIZABLE transaction** to prevent double-booking.

📋 **Recommended indexes (require a migration — NOT applied here; see rollback doc re: migration drift):**
- `Booking(checkOut)` or composite for availability-overlap queries.
- `Payment(paymentStatus, createdAt)` — super-admin payment lists filter/sort on these.
- `Subscription(status, renewalDate)` — billing/renewal queries.
- `Property.location` search uses `contains`/ILIKE; a plain B-tree won't help. For scale, add a
  **GIN trigram index** (`pg_trgm`) — Postgres-native, safe, but a manual migration.

⚠️ Reconcile Prisma migration drift **before** running `prisma migrate deploy` (see rollback doc).

---

## 4. Reliability, error handling & storage

### Error handling — ✅
- API routes wrap work in try/catch and return **generic** messages (no stack leaks); server
  errors go to `console.error`. `getSessionUserId` / cron / webhook fail closed.
- App has `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`; data pages have empty states.

### File uploads — ⚠️ **production blocker**
[lib/uploads/image-upload.ts](../lib/uploads/image-upload.ts) writes to `public/uploads/` on the
local filesystem. **Vercel's serverless filesystem is ephemeral/read-only** — uploaded files
won't persist or be served in production. The file comment already flags this. Before hosts rely
on uploads in prod, swap to object storage (**Vercel Blob**, Cloudinary, S3, or UploadThing).
🔒 Needs decision (adds a dependency/service).
- Minor hardening: current MIME check trusts `file.type`; magic-byte sniffing is a future nicety.

### Monitoring & logging — ⚠️ / 🔒
- Today: Vercel platform logs + `console.*`. No error aggregation, alerting, or tracing.
- 🔒 Recommend **Sentry** (`@sentry/nextjs`) for error tracking + release health, or Axiom/Logtail
  for structured logs. Adds a dependency → needs your go-ahead. Until then, Vercel logs cover the
  critical flows (auth failures, rate-limit blocks, booking/webhook/db errors all `console.error`).

---

## 5. AI / RAG readiness — 📋 (nothing exists)
No AI feature, dependencies, models, or vector store exist. Per instructions, **no RAG code or
dependencies were added.** A complete architecture plan (chunking, hybrid retrieval, cross-encoder
rerank, context-window management, per-user/role privacy filtering, "I don't know" handling,
pgvector + HNSW, semantic caching) is documented in [rag-readiness-plan.md](./rag-readiness-plan.md).

---

## 6. Rollback & recovery — ✅ documented
See [rollback-strategy.md](./rollback-strategy.md): git revert, Vercel instant rollback,
Prisma migration reversal, Neon backup/PITR posture, and feature-flag/kill-switch guidance for
rate limiting and any future AI features.

---

## Changes made in this pass (safe, low-risk only)
- ✅ Rate limiting added to **booking create**, **image upload**, **host subscribe** routes
  (existing in-memory limiter; generous per-user limits; returns 429 with a clear message).
- ✅ `.env.example` extended with commented **optional/future** vars (Upstash, Sentry).
- ✅ Documentation: this checklist, `rollback-strategy.md`, `rag-readiness-plan.md`.
- ❌ No dependencies added, no migrations run, no API contracts changed, no auth/booking/host/admin
  behavior altered.

## Recommendations needing your decision (not done — would add deps/migrations/features)
1. 🔒 **Object storage for uploads** (production blocker) — Vercel Blob / Cloudinary / S3.
2. 🔒 **Distributed rate limiting** — Upstash Redis (`@upstash/ratelimit` + `@upstash/redis`).
3. 🔒 **Error monitoring** — Sentry or equivalent.
4. 🔒 **Recommended DB indexes** — after reconciling migration drift.
5. 🔒 **Password-reset feature** — build to the spec in §2 if wanted.
6. 🔒 **AI/RAG** — only if/when the product needs it (see RAG plan).
