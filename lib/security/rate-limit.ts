// Rate limiter with two backends, selected automatically at runtime:
//
//   • Upstash Redis (durable, coordinated across instances) — used when
//     UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set. This is the
//     production-grade path.
//   • In-memory sliding window — DEV / FALLBACK ONLY. State is per-process, so
//     it resets on restart/redeploy and does NOT coordinate across serverless
//     instances. It is NOT sufficient for real abuse protection in production.
//
// Prefer `enforceRateLimit()` in route handlers (returns a ready 429), or
// `rateLimit()` when you need the raw result. Both are async — always await.

import { NextResponse } from "next/server";
import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();
const MAX_STORE_ENTRIES = 10_000;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // Unix seconds
}

/**
 * In-memory sliding-window limiter. DEV / FALLBACK ONLY — see file header.
 * Exported for direct use only in single-process contexts (scripts/tests).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const cutoff = now - windowMs;

  let entry = store.get(key);
  if (!entry) {
    // Evict oldest entry if store is full (Map preserves insertion order)
    if (store.size >= MAX_STORE_ENTRIES) {
      const oldest = store.keys().next().value;
      if (oldest !== undefined) store.delete(oldest);
    }
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Drop timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const count = entry.timestamps.length;
  const resetAt = Math.ceil(((entry.timestamps[0] ?? now) + windowMs) / 1000);

  if (count >= limit) {
    return { success: false, limit, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  return { success: true, limit, remaining: limit - count - 1, resetAt };
}

// --- Upstash Redis backend (lazy + cached) ---
let redis: Redis | null | undefined;
const limiters = new Map<string, Ratelimit>();
let warnedInMemory = false;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const client = getRedis();
  if (!client) return null;
  const cacheKey = `${limit}:${windowMs}`;
  let rl = limiters.get(cacheKey);
  if (!rl) {
    rl = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms` as Duration),
      prefix: "pearlora_rl",
      analytics: false,
    });
    limiters.set(cacheKey, rl);
  }
  return rl;
}

/**
 * Check a rate-limit bucket. Uses Upstash Redis when configured, otherwise the
 * in-memory fallback (dev only). Always await.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const upstash = getUpstashLimiter(limit, windowMs);
  if (upstash) {
    const { success, remaining, reset } = await upstash.limit(key);
    return { success, limit, remaining, resetAt: Math.ceil(reset / 1000) };
  }

  if (!warnedInMemory && process.env.NODE_ENV === "production") {
    warnedInMemory = true;
    console.warn(
      "[rate-limit] Upstash env vars not set — falling back to the IN-MEMORY limiter, " +
        "which is NOT production-grade (per-process, resets on redeploy, no cross-instance " +
        "coordination). Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }
  return checkRateLimit(key, limit, windowMs);
}

/**
 * Route-handler guard. Returns a ready-to-return 429 response (with Retry-After)
 * when the bucket is exhausted, or null when the request may proceed.
 *
 *   const limited = await enforceRateLimit(`booking:${userId}`, 10, 10 * 60_000);
 *   if (limited) return limited;
 */
export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again later."
): Promise<NextResponse | null> {
  const result = await rateLimit(key, limit, windowMs);
  if (result.success) return null;
  const retryAfter = Math.max(0, result.resetAt - Math.floor(Date.now() / 1000));
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
