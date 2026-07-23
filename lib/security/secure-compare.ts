import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time comparison of two secret strings (tokens, shared secrets).
 *
 * Differing lengths short-circuit to `false` — length is not treated as secret,
 * which is the standard, accepted trade-off for bearer-token / shared-secret
 * checks. Use this instead of `===` / `!==` for anything that authenticates a
 * caller, to avoid leaking the secret through response-timing differences.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
