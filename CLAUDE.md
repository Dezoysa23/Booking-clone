# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint

# Database
npx prisma migrate dev    # Run migrations and regenerate client
npx prisma db push        # Push schema changes without migration history
npx prisma studio         # Open database GUI
npx prisma generate       # Regenerate Prisma client after schema changes
```

No test suite is configured.

## Architecture

**Stack**: Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 6 + PostgreSQL (Neon), bcryptjs.

### Authentication

Custom HMAC-SHA256 session tokens stored in httpOnly cookies (`booking_clone_session`, 7-day expiry). No third-party auth library. All auth logic is in [lib/auth.ts](lib/auth.ts):
- `getCurrentUser()` — reads cookie, verifies HMAC signature, fetches user from DB
- `getSessionUserId()` — returns userId from verified cookie without DB call

API routes call these server-side; there is no middleware-based auth guard. Each protected route must call `getCurrentUser()` or `getSessionUserId()` and return a 401 manually.

### Database

Prisma ORM with three models: `User` (CUID id, role enum USER/ADMIN), `Property` (Int id, price in LKR), `Booking` (status enum PENDING/CONFIRMED/CANCELLED). Prisma client singleton is at [lib/prisma.ts](lib/prisma.ts). Schema at [prisma/schema.prisma](prisma/schema.prisma).

Required environment variables (`.env`):
- `DATABASE_URL` — pooled Neon connection string
- `DIRECT_URL` — direct connection for Prisma migrations
- `SESSION_SECRET` — HMAC signing secret (dev fallback warns loudly but still works)

### API Routes (`app/api/`)

| Route | Methods | Auth |
|---|---|---|
| `/api/auth/login` | POST | — |
| `/api/auth/logout` | POST | — |
| `/api/properties` | GET | — |
| `/api/properties/[id]` | GET | — |
| `/api/bookings` | GET, POST | User |
| `/api/bookings/[id]` | GET | User + ownership |
| `/api/bookings/[id]/cancel` | PATCH | User + ownership |
| `/api/account` | GET, PATCH | User |
| `/api/account/change-password` | PATCH | User |
| `/api/admin/properties` | POST | ADMIN role |

### Pages (`app/`)

Server components fetch data directly via Prisma or `getCurrentUser()`. Client components (forms, interactive UI) are marked `"use client"` and call API routes via `fetch`. There is no global state manager — auth state is read server-side per request.

Public: `/`, `/login`, `/signup`, `/results`, `/properties/[id]`
Protected: `/bookings`, `/account`, `/booking-confirmation/[id]`
Admin: `/admin`, `/admin/properties/new`

### Path Alias

`@/` maps to the project root (e.g., `@/lib/auth`, `@/components/Navbar`).
