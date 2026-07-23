/**
 * Shared request-validation helpers used across API route handlers.
 */

/** Coerce a value to a trimmed string, or "" if it isn't a string. */
export function safeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Validate a property image reference: an http(s):// URL, or a local
 * /uploads/properties/ path (rejecting path traversal and null bytes).
 */
export function isValidImagePath(p: string): boolean {
  if (!p || p.length > 2048) return false;
  if (p.startsWith("http://") || p.startsWith("https://")) return true;
  if (p.startsWith("/uploads/properties/") && !p.includes("..") && !p.includes("\0"))
    return true;
  return false;
}
