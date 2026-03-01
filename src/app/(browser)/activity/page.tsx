import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ActivityContent } from "@/components/activity/activity-content";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveStreak } from "@/lib/utils/streak";

export const metadata: Metadata = {
  title: "Activity - Pulse",
  description: "Your pulse activity and stats",
};

export default async function BrowserActivityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/profile-setup");
  }

  const currentStreak = getEffectiveStreak(
    profile.current_streak,
    profile.last_pulse_date,
  );
  const longestStreak: number = profile.longest_streak;

  const { data: pulseCalendarData } = await supabase.rpc("get_pulse_calendar", {
    p_days: 30,
  });
  const pulsedDates: string[] = pulseCalendarData ?? [];

  const { count: totalPulses } = await supabase
    .from("daily_pulses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <ActivityContent
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      pulsedDates={pulsedDates}
      memberSince={profile.created_at}
      totalPulses={totalPulses ?? 0}
    />
  );
}
