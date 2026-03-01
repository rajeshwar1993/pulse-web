import { redirect } from "next/navigation";
import { ActivityContent } from "@/components/activity/activity-content";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveStreak } from "@/lib/utils/streak";

export default async function AppviewActivityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/appview/profile-setup");
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

  return (
    <div className="min-h-screen bg-[var(--off-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <ActivityContent
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          pulsedDates={pulsedDates}
          memberSince={profile.created_at}
          totalPulses={profile.total_pulse_count ?? 0}
        />
      </div>
    </div>
  );
}
