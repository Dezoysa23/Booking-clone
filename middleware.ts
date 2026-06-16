import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware — runs before every matched request.
 *
 * Responsibilities:
 *  1. HTTPS enforcement (production: redirect http → https via 308)
 *  2. Security response headers on every page/API response
 *
 * Auth is handled per-route via lib/auth.ts — no session logic here
 * so that server-component auth (getCurrentUser) keeps working unchanged.
 */
export function middleware(request: NextRequest) {
  // ── 1. HTTPS enforcement ────────────────────────────────────────────────
  // Only applies when behind a reverse proxy that sets x-forwarded-proto
  // (Vercel, Netlify, most hosting providers do this automatically).
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl, { status: 308 }); // 308 = Permanent Redirect, keeps method
  }

  const response = NextResponse.next();

  // ── 2. Security headers ─────────────────────────────────────────────────

  // Prevent MIME-type sniffing (browsers must respect Content-Type)
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Block framing — kept as fallback for browsers that don't support frame-ancestors CSP
  response.headers.set("X-Frame-Options", "DENY");

  // Legacy XSS filter (defence-in-depth for old browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Control how much referrer info is sent to third parties
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser feature access
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // Content Security Policy — key protections:
  // frame-ancestors 'none' blocks clickjacking (stronger than X-Frame-Options)
  // object-src 'none' blocks Flash and plugin-based attacks
  // base-uri 'self' prevents <base> tag injection
  // form-action 'self' prevents form submission hijacking
  // script-src includes unsafe-inline/unsafe-eval for Next.js hydration (nonce-based
  // hardening can be added later when Next.js nonce support is configured)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "media-src 'none'",
    "object-src 'none'",
    "connect-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  // HSTS — only set in production (dev has no TLS cert)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf)$).*)",
  ],
};
