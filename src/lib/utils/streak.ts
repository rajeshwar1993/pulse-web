import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";

/**
 * Get today's logical pulse-day date (accounting for 4 AM boundary).
 * A pulse at 3 AM belongs to the previous calendar day.
 */
export function getTodayPulseDay(): string {
  const now = new Date();
  const adjusted = new Date(now.getTime());
  adjusted.setHours(adjusted.getHours() - PULSE_DAY_RESET_HOUR);
  // Return YYYY-MM-DD in local time
  return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, "0")}-${String(adjusted.getDate()).padStart(2, "0")}`;
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
