import * as Sentry from "@sentry/nextjs";

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  debug: (msg: string, ctx?: Record<string, unknown>) => {
    if (isDev) console.log(`[DEBUG] ${msg}`, ctx ?? "");
  },
  info: (msg: string, ctx?: Record<string, unknown>) => {
    console.info(`[INFO] ${msg}`, ctx ?? "");
  },
  warn: (msg: string, error?: unknown, ctx?: Record<string, unknown>) => {
    console.warn(`[WARN] ${msg}`, error, ctx ?? "");
    if (error instanceof Error) {
      Sentry.captureException(error, { level: "warning", extra: ctx });
    } else if (error) {
      Sentry.captureMessage(`${msg}: ${String(error)}`, {
        level: "warning",
        extra: ctx,
      });
    }
  },
  error: (msg: string, error?: unknown, ctx?: Record<string, unknown>) => {
    console.error(`[ERROR] ${msg}`, error, ctx ?? "");
    if (error instanceof Error) {
      Sentry.captureException(error, { level: "error", extra: ctx });
    } else if (error) {
      Sentry.captureMessage(`${msg}: ${String(error)}`, {
        level: "error",
        extra: ctx,
      });
    }
  },
};
