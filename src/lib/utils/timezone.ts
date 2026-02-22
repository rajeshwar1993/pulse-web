/**
 * Timezone utility functions for displaying partner's local time.
 * Uses the browser's native Intl.DateTimeFormat API — no external dependencies.
 */

/**
 * Format the current time in a given IANA timezone.
 * Returns a localized time string like "10:00 PM".
 * Returns empty string for invalid timezone.
 */
export function formatTimeInTimezone(timezone: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return "";
  }
}

/**
 * Get the current hour (0-23) in a given IANA timezone.
 * Returns -1 for invalid timezone.
 */
export function getHourInTimezone(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).formatToParts(new Date());

    const hourPart = parts.find((p) => p.type === "hour");
    return hourPart ? Number.parseInt(hourPart.value, 10) : -1;
  } catch {
    return -1;
  }
}

export type WaitingContext = "morning" | "daytime" | "late";

/**
 * Determine the waiting context based on the partner's local time.
 * - morning (4 AM – 10 AM): pulse day just started, too early to worry
 * - daytime (10 AM – 10 PM): normal hours, may pulse later
 * - late (10 PM – 4 AM): unlikely to pulse today
 *
 * Returns "daytime" for invalid timezone (safe default).
 */
export function getWaitingContext(timezone: string): WaitingContext {
  const hour = getHourInTimezone(timezone);
  if (hour === -1) return "daytime";

  if (hour >= 4 && hour < 10) return "morning";
  if (hour >= 10 && hour < 22) return "daytime";
  return "late";
}
