// Accepts only strings that look like a plausible IPv4 or IPv6 address.
// Rejects values with spaces, path segments, or other injection attempts
// so a forged X-Forwarded-For header can't bypass rate limiting with a
// crafted key that has no real match in the store.
function isPlausibleIp(raw: string): boolean {
  if (!raw || raw.length > 45) return false; // max IPv6 length
  // Allow only hex digits, dots, colons — the character set of IPv4/IPv6
  return /^[0-9a-fA-F.:]+$/.test(raw);
}

export function getClientIp(request: Request): string {
  // Prefer x-real-ip: on Vercel (and most platforms) this is the true client IP set by
  // the platform edge and cannot be forged by a client-supplied header.
  const realIp = request.headers.get("x-real-ip")?.trim() ?? "";
  if (isPlausibleIp(realIp)) return realIp;

  // Fall back to X-Forwarded-For. Use the LAST (rightmost) entry — the one appended by
  // the nearest trusted proxy — NOT the leftmost, which a client can spoof/prepend to
  // bypass IP-keyed rate limits.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && isPlausibleIp(last)) return last;
  }
  return "unknown";
}
