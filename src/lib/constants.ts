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
// Deep Links
// ---------------------------------------------------------------------------

/** Deep link scheme for Pulse app */
export const PULSE_DEEP_LINK_SCHEME = "pulse://";

/** Deep link URL prefix for invite codes */
export const INVITE_DEEP_LINK_PREFIX = `${PULSE_DEEP_LINK_SCHEME}invite?code=`;

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
