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
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (isPlausibleIp(first)) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim() ?? "";
  if (isPlausibleIp(realIp)) return realIp;
  return "unknown";
}
