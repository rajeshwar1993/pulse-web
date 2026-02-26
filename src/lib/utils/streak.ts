import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";

/**
 * Convert any Date to its logical pulse-day string (YYYY-MM-DD),
 * accounting for the 4 AM boundary. A pulse at 3 AM belongs to the
 * previous calendar day.
 */
export function getPulseDayDate(date: Date): string {
  const adjusted = new Date(date.getTime());
  adjusted.setHours(adjusted.getHours() - PULSE_DAY_RESET_HOUR);
  return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, "0")}-${String(adjusted.getDate()).padStart(2, "0")}`;
}

/**
 * Get today's logical pulse-day date (accounting for 4 AM boundary).
 * A pulse at 3 AM belongs to the previous calendar day.
 */
export function getTodayPulseDay(): string {
  return getPulseDayDate(new Date());
}

/**
 * Get the start of the current Pulse Day as a Date (4:00 AM local time).
 * Before 4 AM, returns yesterday at 4 AM; after 4 AM, returns today at 4 AM.
 */
export function getStartOfPulseDay(): Date {
  const now = new Date();
  const today4AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    PULSE_DAY_RESET_HOUR,
    0,
    0,
  );

  if (now < today4AM) {
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  }
  return today4AM;
}

/**
 * Compute the effective current streak, accounting for staleness.
 *
 * The database stores the streak as of the last pulse. If the user hasn't
 * pulsed today or yesterday (in pulse-day terms), the streak is broken → 0.
 */
export function getEffectiveStreak(
  currentStreak: number,
  lastPulseDate: string | null,
): number {
  if (!lastPulseDate || currentStreak === 0) return 0;

  const todayPulseDay = getTodayPulseDay();
  const today = new Date(`${todayPulseDay}T00:00:00`);
  const lastPulse = new Date(`${lastPulseDate}T00:00:00`);
  const diffDays = Math.floor(
    (today.getTime() - lastPulse.getTime()) / (1000 * 60 * 60 * 24),
  );

  // Streak is alive if last pulse was today or yesterday (in pulse-day terms)
  if (diffDays <= 1) return currentStreak;
  return 0;
}
