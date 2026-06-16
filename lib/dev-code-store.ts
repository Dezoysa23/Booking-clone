/**
 * In-memory store for plaintext verification codes — DEV ONLY.
 * Never imported in production (guarded by NODE_ENV checks at every call site).
 * Codes are evicted after 20 minutes to avoid unbounded growth.
 */

const EVICT_AFTER_MS = 20 * 60 * 1000;

interface DevEntry {
  code: string;
  expiresAt: number;
}

const store = new Map<string, DevEntry>(); // key = normalised email

export function devStoreCode(email: string, code: string): void {
  store.set(email.toLowerCase(), { code, expiresAt: Date.now() + EVICT_AFTER_MS });
}

export function devPeekCode(email: string): string | null {
  const entry = store.get(email.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return null;
  }
  return entry.code;
}
