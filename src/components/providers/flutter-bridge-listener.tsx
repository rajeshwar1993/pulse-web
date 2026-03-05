"use client";

import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useEffect } from "react";
import type { SupportedLocale } from "@/i18n/config";
import { supportedLocales } from "@/i18n/config";
import { LocaleService } from "@/lib/services/locale-service";

/**
 * Resolves the pulse_session_id from Flutter using three redundant channels:
 * 1. CustomEvent (flutter-session-init) — dispatched on every page finish
 * 2. Cookie (pulse-session-id) — set alongside Supabase session
 * 3. URL query param (?pulseSessionId=) — fallback
 */
function getSessionIdFromCookie(): string | null {
  const match = document.cookie.match(/pulse-session-id=([^;]+)/);
  return match?.[1] ?? null;
}

function getSessionIdFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("pulseSessionId");
}

function applySessionId(sessionId: string) {
  Sentry.setTag("pulse_session_id", sessionId);
  posthog.register({ pulse_session_id: sessionId });
}

export function FlutterBridgeListener() {
  const router = useRouter();

  useEffect(() => {
    // --- Session correlation ---
    // Try cookie or URL param immediately (for first load)
    const cookieSessionId = getSessionIdFromCookie();
    const urlSessionId = getSessionIdFromUrl();
    const initialSessionId = cookieSessionId || urlSessionId;
    if (initialSessionId) {
      applySessionId(initialSessionId);
    }

    // Listen for CustomEvent from Flutter (dispatched on every onPageFinished)
    const handleSessionInit = (
      event: CustomEvent<{ pulseSessionId: string }>,
    ) => {
      const sessionId = event.detail?.pulseSessionId;
      if (sessionId) {
        applySessionId(sessionId);
      }
    };

    window.addEventListener(
      "flutter-session-init",
      handleSessionInit as EventListener,
    );

    // --- Locale changes ---
    const handleLocaleChanged = (event: CustomEvent<{ locale: string }>) => {
      const locale = event.detail?.locale;
      if (locale && supportedLocales.includes(locale as SupportedLocale)) {
        LocaleService.setStoredLocale(locale as SupportedLocale);
        router.refresh();
      }
    };

    window.addEventListener(
      "flutter-locale-changed",
      handleLocaleChanged as EventListener,
    );

    return () => {
      window.removeEventListener(
        "flutter-session-init",
        handleSessionInit as EventListener,
      );
      window.removeEventListener(
        "flutter-locale-changed",
        handleLocaleChanged as EventListener,
      );
    };
  }, [router]);

  return null;
}
