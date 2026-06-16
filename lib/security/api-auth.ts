import { NextResponse } from "next/server";
import { getCurrentUser, getSessionUserId } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import type { User } from "@prisma/client";

type Fail = { ok: false; response: NextResponse };
type Ok<T> = { ok: true; data: T };
type AuthResult<T> = Ok<T> | Fail;

function fail(message: string, status: number): Fail {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) };
}

/** Require a valid session. Returns userId only — no DB round-trip. */
export async function requireUserId(): Promise<AuthResult<{ userId: string }>> {
  const userId = await getSessionUserId();
  if (!userId) return fail("Authentication required.", 401);
  return { ok: true, data: { userId } };
}

/** Require a valid session. Returns the full User record. */
export async function requireUser(): Promise<AuthResult<{ user: User }>> {
  const user = await getCurrentUser();
  if (!user) return fail("Authentication required.", 401);
  return { ok: true, data: { user } };
}

/** Require HOST or ADMIN/SUPER_ADMIN role. */
export async function requireHostOrAdmin(): Promise<AuthResult<{ user: User }>> {
  const result = await requireUser();
  if (!result.ok) return result;
  if (!isHostOrAdmin(result.data.user)) return fail("Host access required.", 403);
  return result;
}

/** Require ADMIN or SUPER_ADMIN role. */
export async function requireSuperAdmin(): Promise<AuthResult<{ user: User }>> {
  const result = await requireUser();
  if (!result.ok) return result;
  if (!isSuperAdmin(result.data.user)) return fail("Administrator access required.", 403);
  return result;
}

/**
 * Parse a positive-integer route segment.
 * Returns `null` when the value is not a safe positive integer — caller should return 400.
 */
export function parseIntParam(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
