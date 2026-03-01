/**
 * Compute the monthly pulse rate as an integer percentage (0–100).
 *
 * Eligible days = days from max(memberSince, 1st of month) to todayPulseDay, inclusive.
 * Both memberSince and todayPulseDay are YYYY-MM-DD strings.
 */
export function computePulseRate(
  pulsedCount: number,
  memberSince: string,
  todayPulseDay: string,
): number {
  // Extract year/month from todayPulseDay
  const [yearStr, monthStr] = todayPulseDay.split("-");
  const firstOfMonth = `${yearStr}-${monthStr}-01`;

  // Eligible window starts at whichever is later: memberSince or 1st of month
  const memberSinceDate = memberSince.slice(0, 10); // handle ISO timestamps
  const windowStart =
    memberSinceDate > firstOfMonth ? memberSinceDate : firstOfMonth;

  // Count eligible days (windowStart to todayPulseDay, inclusive)
  const startMs = new Date(windowStart).getTime();
  const endMs = new Date(todayPulseDay).getTime();
  const eligibleDays = Math.floor((endMs - startMs) / 86_400_000) + 1;

  if (eligibleDays <= 0) return 0;

  const rate = Math.round((pulsedCount / eligibleDays) * 100);
  return Math.min(Math.max(rate, 0), 100);
}
