// In-memory sliding-window rate limiter — suitable for single-process dev/staging.
//
// To use Upstash Redis in production, install @upstash/ratelimit + @upstash/redis
// and replace checkRateLimit calls with:
//   const rl = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "10 m") });
//   const { success, reset } = await rl.limit(key);

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
  const resetAt = Math.ceil(
    ((entry.timestamps[0] ?? now) + windowMs) / 1000
  );

  if (count >= limit) {
    return { success: false, limit, remaining: 0, resetAt };
  }

  entry.timestamps.push(now);
  return { success: true, limit, remaining: limit - count - 1, resetAt };
}
