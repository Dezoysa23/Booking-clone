import * as Sentry from "@sentry/nextjs";

/**
 * Next.js server/edge instrumentation. Sentry initializes ONLY when SENTRY_DSN is
 * set — otherwise this is a no-op and the SDK is never initialized.
 */
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  } else if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Reports errors thrown in nested React Server Components, route handlers, and
// server actions. No-op when Sentry was never initialized (DSN unset).
export const onRequestError = Sentry.captureRequestError;
