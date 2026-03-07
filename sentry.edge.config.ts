import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.NEXT_PUBLIC_WEB_VERSION,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
