/**
 * Best-effort client IP for rate-limiting keys.
 *
 * Prefers platform-set headers that a client cannot forge when the app runs
 * behind Vercel's edge. `x-forwarded-for` is used only as a last resort:
 * behind a trusted proxy its first entry is the real client IP, but if this app
 * is ever served WITHOUT a trusted proxy in front, that header is
 * client-spoofable and per-IP limits could be bypassed.
 */
export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
