# Pearlora — Password Reset

Self-service "forgot password" flow. New, additive feature — no existing auth/booking behavior
changed. (Once this and the production-readiness PR both merge, flip §2 of
`production-readiness-checklist.md` from 📋 to ✅.)

## Flow
1. **`/forgot-password`** → user enters email → `POST /api/auth/forgot-password`.
2. A single-use token is emailed as `${NEXT_PUBLIC_BASE_URL}/reset-password?token=…`.
3. **`/reset-password?token=…`** → user sets a new password → `POST /api/auth/reset-password`.
4. On success, all of the user's sessions are revoked and they're redirected to `/login`.

A **"Forgot password?"** link was added to the login form.

## Security properties (built to the checklist spec)
- **Token:** 32 random bytes (base64url). Only the **SHA-256 hash** is stored (`PasswordResetToken.tokenHash`, unique); the raw token exists only in the email link.
- **Expiry:** 30 minutes (`expiresAt`).
- **Single use:** `usedAt` is set on consumption; expired/used/unknown tokens all return the same generic error.
- **No enumeration:** `/forgot-password` always returns the same generic response whether or not the email exists; errors are uniform (not email-specific).
- **One active token per user:** issuing a new token deletes the user's previous unused tokens.
- **Strong password enforced:** min 8 chars (shared `newPasswordField` Zod rule).
- **Session invalidation:** `revokeAllUserSessions(userId)` runs after a successful reset.
- **Rate limited:** request = 5 / 15 min per IP **and** per email; submit = 10 / 15 min per IP. CSRF origin check on both routes.

## Files
- Model: `PasswordResetToken` in `prisma/schema.prisma` (+ `User.passwordResetTokens` relation).
- Service: [lib/password-reset.ts](../lib/password-reset.ts) — create/send + consume.
- Email: [lib/email/templates/password-reset.ts](../lib/email/templates/password-reset.ts).
- Routes: [app/api/auth/forgot-password/route.ts](../app/api/auth/forgot-password/route.ts), [app/api/auth/reset-password/route.ts](../app/api/auth/reset-password/route.ts).
- UI: [app/forgot-password/page.tsx](../app/forgot-password/page.tsx), [app/reset-password/page.tsx](../app/reset-password/page.tsx) + [components/ResetPasswordForm.tsx](../components/ResetPasswordForm.tsx).
- Validation: `forgotPasswordSchema`, `resetPasswordSchema` in `lib/validation/schemas.ts`.

## ⚠️ Database migration (operator action — not applied here)
Adds one new table, `PasswordResetToken`. **The feature returns errors until the table exists.**
Because of the known Prisma migration drift, apply deliberately:

- **Preferred (after reconciling drift):** `npx prisma migrate dev --name add_password_reset_token`
- **Direct apply (new table only, idempotent):**
  ```bash
  npx prisma db execute --file prisma/sql/add-password-reset-table.sql --schema prisma/schema.prisma
  ```
- **psql:** `psql "$DIRECT_URL" -f prisma/sql/add-password-reset-table.sql`

Rollback: `DROP TABLE IF EXISTS "PasswordResetToken";` (loses only reset tokens, no user data).

## Notes
- Uses the existing multi-provider email sender (Gmail → Resend → dev console). In dev with no
  provider, the reset link is logged to the server console.
- `NEXT_PUBLIC_BASE_URL` should be set so the link host is correct in emails; falls back to the
  request origin otherwise.
