// Origin/Referer CSRF protection for state-changing API routes.
// Works in conjunction with SameSite=Lax session cookies.
//
// Do NOT apply to webhook endpoints — those use provider signature verification.

export function verifyCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!host) return false;

  const isDev = process.env.NODE_ENV !== "production";

  if (origin) {
    if (origin === `https://${host}`) return true;
    if (isDev && origin === `http://${host}`) return true;
    return false;
  }

  // Some same-origin requests omit Origin but include Referer
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  // No Origin or Referer — allow only in dev (curl/Postman testing)
  return isDev;
}
