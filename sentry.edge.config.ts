import * as Sentry from "@sentry/nextjs";

// Only imported (by instrumentation.ts register()) when SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: Boolean(process.env.SENTRY_DSN),
});
