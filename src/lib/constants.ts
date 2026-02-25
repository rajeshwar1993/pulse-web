/**
 * Shared constants for the Pulse web application.
 *
 * Centralises magic values so every module references a single source of truth.
 */

// ---------------------------------------------------------------------------
// Locale
// ---------------------------------------------------------------------------

/** Cookie / localStorage key for persisting user's locale preference */
export const LOCALE_COOKIE_NAME = "pulse-locale";

// ---------------------------------------------------------------------------
// Invite Links
// ---------------------------------------------------------------------------

/** Base URL for invite links (defaults to current origin) */
export const INVITE_BASE_URL =
  process.env.NEXT_PUBLIC_INVITE_BASE_URL || "";

/** Build a full invite URL for the given code */
export function getInviteUrl(code: string): string {
  const base =
    INVITE_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/invite?code=${code}`;
}

// ---------------------------------------------------------------------------
// Flutter Bridge
// ---------------------------------------------------------------------------

/** Delay (ms) before sending Flutter ready signal — allows DOM to settle */
export const FLUTTER_READY_SIGNAL_DELAY_MS = 500;

// ---------------------------------------------------------------------------
// Pulse Day
// ---------------------------------------------------------------------------

/** Hour (0-23) when Pulse Day resets (4 AM local) */
export const PULSE_DAY_RESET_HOUR = 4;

// ---------------------------------------------------------------------------
// Wisdom Service
// ---------------------------------------------------------------------------

/** Key for storing last wisdom in sessionStorage */
export const WISDOM_SESSION_KEY = "pulse_last_wisdom";

/** Maximum retry attempts when selecting a non-repeating wisdom phrase */
export const WISDOM_MAX_ATTEMPTS = 10;

// ---------------------------------------------------------------------------
// Missed Pulse Survey
// ---------------------------------------------------------------------------

/** Response options displayed to the user (excludes "skipped" which is automatic). */
export const MISSED_PULSE_RESPONSES = [
  "forgot",
  "busy",
  "tech_issue",
  "not_feeling_it",
] as const;
