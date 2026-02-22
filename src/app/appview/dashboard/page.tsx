import { redirect } from "next/navigation";
import type { Connection } from "@/components/dashboard/connection-grid";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveStreak, getTodayPulseDay } from "@/lib/utils/streak";

/**
 * Get the start of the current Pulse Day (4:00 AM local time)
 */
function getStartOfPulseDay(): Date {
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
    // Before 4 AM, Pulse Day started yesterday at 4 AM
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  } else {
    // After 4 AM, Pulse Day started today at 4 AM
    return today4AM;
  }
}

export default async function Dashboard() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/appview/profile-setup");
  }

  // Check if user has pulsed today
  const pulseDayStart = getStartOfPulseDay();
  const { data: todayPulse } = await supabase
    .from("daily_pulses")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", pulseDayStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isActive = todayPulse !== null;
  const pulseTime = todayPulse?.created_at
    ? new Date(todayPulse.created_at)
    : null;

  // Compute effective streak (handles staleness)
  const currentStreak = getEffectiveStreak(
    profile.current_streak,
    profile.last_pulse_date,
  );
  const longestStreak: number = profile.longest_streak;

  // Fetch pulse calendar (last 30 days) for Ghost Calendar
  const { data: pulseCalendarData } = await supabase.rpc(
    "get_pulse_calendar",
    { p_days: 30 },
  );
  const pulsedDates: string[] = pulseCalendarData ?? [];

  // Connections will be fetched from real data in a future unit
  const connections: Connection[] = [];
  // Note: When connections are populated, map timezone from ConnectionWithProfile:
  // { ...conn, timezone: conn.timezone }

  // --- Missed pulse survey detection ---
  let missedPulseDate: string | null = null;
  if (profile.last_pulse_date) {
    const todayPulseDay = getTodayPulseDay();
    const today = new Date(`${todayPulseDay}T00:00:00`);
    const yesterdayPulseDay = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yStr = `${yesterdayPulseDay.getFullYear()}-${String(yesterdayPulseDay.getMonth() + 1).padStart(2, "0")}-${String(yesterdayPulseDay.getDate()).padStart(2, "0")}`;

    if (profile.last_pulse_date < yStr) {
      // User missed yesterday — check if already surveyed
      const { data: existingSurvey } = await supabase
        .from("missed_pulse_surveys")
        .select("id")
        .eq("user_id", user.id)
        .eq("missed_date", yStr)
        .maybeSingle();

      if (!existingSurvey) {
        missedPulseDate = yStr;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <DashboardContent
          displayName={profile.display_name}
          isActive={isActive}
          pulseTime={pulseTime}
          connections={connections}
          showWisdom={isActive}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          pulsedDates={pulsedDates}
          missedPulseDate={missedPulseDate}
        />
      </div>
    </div>
  );
}
