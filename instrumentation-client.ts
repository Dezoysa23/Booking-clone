// Browser (client) instrumentation.
//
// Sentry loads ONLY when NEXT_PUBLIC_SENTRY_DSN is set at build time. Because the
// value is inlined at build, an unset DSN turns the block below into dead code and
// the Sentry browser SDK is never shipped to clients (no bundle cost when disabled).
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  });
}
