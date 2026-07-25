// Rate limiter with two backends:
//   • Upstash Redis (distributed) when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set —
//     shared across all serverless instances, so limits hold on Vercel.
//   • In-memory sliding window otherwise (dev / unconfigured) — per-process only.
//
// checkRateLimit is async. On any Upstash error it fails over to the in-memory
// limiter so a Redis outage degrades gracefully rather than blocking requests.

import { Ratelimit } from "@upstash/ratelimit";
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

// ── In-memory sliding window (fallback) ───────────────────────────────────────
function inMemoryRateLimit(
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

// ── Upstash Redis (distributed) ───────────────────────────────────────────────
const upstashConfigured =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let redis: Redis | null = null;
// Cache one Ratelimit instance per (limit, window) so we don't rebuild them per request.
const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = limiterCache.get(cacheKey);
  if (!limiter) {
    redis ??= Redis.fromEnv();
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      prefix: "pearlora:rl",
      analytics: false,
    });
    limiterCache.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Enforce a rate limit: at most `limit` requests per `windowMs` for `key`.
 * Uses Upstash Redis when configured (shared across serverless instances),
 * otherwise an in-memory sliding window. Fails over to in-memory on Upstash error.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (upstashConfigured) {
    try {
      const res = await getUpstashLimiter(limit, windowMs).limit(key);
      return {
        success: res.success,
        limit: res.limit,
        remaining: res.remaining,
        resetAt: Math.ceil(res.reset / 1000),
      };
    } catch (err) {
      console.error("[rate-limit] Upstash error — falling back to in-memory:", err);
    }
  }
  return inMemoryRateLimit(key, limit, windowMs);
}
