import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Connection } from "@/components/dashboard/connection-grid";
import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { BrowserDashboardClient } from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard - Pulse",
  description: "Your daily pulse status and connections",
};

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
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  }
  return today4AM;
}

export default async function BrowserDashboard() {
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

  // Fetch pulse calendar (last 30 days) for Ghost Calendar
  const { data: pulseCalendarData } = await supabase.rpc(
    "get_pulse_calendar",
    { p_days: 30 },
  );
  const pulsedDates: string[] = pulseCalendarData ?? [];

  const connections: Connection[] = [];

  return (
    <BrowserDashboardClient
      displayName={profile.display_name}
      isActive={isActive}
      pulseTime={pulseTime}
      connections={connections}
      pulsedDates={pulsedDates}
    />
  );
}
