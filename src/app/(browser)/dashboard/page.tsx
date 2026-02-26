import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchSeatsWithConnections } from "@/lib/queries/seats";
import { createClient } from "@/lib/supabase/server";
import type { ConnectionRequestWithProfile, DashboardConnection } from "@/lib/types/connection";
import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";
import {
  getEffectiveStreak,
  getPulseDayDate,
  getStartOfPulseDay,
  getTodayPulseDay,
} from "@/lib/utils/streak";
import { BrowserDashboardClient } from "./page-client";

export const metadata: Metadata = {
  title: "Dashboard - Pulse",
  description: "Your daily pulse status and connections",
};

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

  // Fetch seats with connections (graceful fallback if seat system unavailable)
  let seats: import("@/lib/types/seat").DashboardSeat[] = [];
  let connections: DashboardConnection[] = [];
  try {
    // Enforce seat expirations before fetching data
    await supabase.rpc("enforce_seat_expirations", { p_user_id: user.id });

    seats = await fetchSeatsWithConnections(supabase, user.id);

    // Derive connections from occupied seats for useSeenReceipts
    connections = seats
      .filter((s) => s.state === "occupied" && s.connection)
      .map((s) => ({
        id: s.connection!.id,
        userId: s.connection!.userId,
        avatar: s.connection!.avatar,
        name: s.connection!.name,
        timezone: s.connection!.timezone,
        status: s.connection!.pulseTime ? ("active" as const) : ("waiting" as const),
        pulseTime: s.connection!.pulseTime,
        currentStreak: s.connection!.currentStreak,
        longestStreak: 0,
      }));
  } catch {
    // Seat system not yet available (migrations pending) — continue with empty seats
  }

  // --- Streak data ---
  const effectiveStreak = getEffectiveStreak(
    profile.current_streak ?? 0,
    profile.last_pulse_date ?? null,
  );

  const todayPulseDay = getTodayPulseDay();
  const profileStartDay = getPulseDayDate(new Date(profile.created_at));
  const totalDays =
    Math.floor(
      (new Date(`${todayPulseDay}T00:00:00`).getTime() -
        new Date(`${profileStartDay}T00:00:00`).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const windowStartDate = new Date();
  windowStartDate.setDate(windowStartDate.getDate() - 11);
  windowStartDate.setHours(PULSE_DAY_RESET_HOUR, 0, 0, 0);

  const { data: recentPulses } = await supabase
    .from("daily_pulses")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", windowStartDate.toISOString())
    .order("created_at", { ascending: true });

  const pulsedDates = [
    ...new Set(
      (recentPulses ?? []).map((p) => getPulseDayDate(new Date(p.created_at))),
    ),
  ];

  // --- Missed pulse survey detection ---
  let missedPulseDate: string | null = null;
  if (profile.last_pulse_date) {
    const today = new Date(`${todayPulseDay}T00:00:00`);
    const yesterdayPulseDay = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yStr = `${yesterdayPulseDay.getFullYear()}-${String(yesterdayPulseDay.getMonth() + 1).padStart(2, "0")}-${String(yesterdayPulseDay.getDate()).padStart(2, "0")}`;

    if (profile.last_pulse_date < yStr) {
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

  // --- Fetch pending connection requests ---
  const { data: pendingRequestsData } = await supabase
    .from("connection_requests")
    .select(
      `
      id,
      from_user_id,
      to_user_id,
      status,
      created_at,
      responded_at,
      from_profile:profiles!connection_requests_from_user_id_fkey(id, display_name, avatar_url)
    `,
    )
    .eq("to_user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingRequests =
    (pendingRequestsData as unknown as ConnectionRequestWithProfile[]) ?? [];

  return (
    <BrowserDashboardClient
      displayName={profile.display_name}
      isActive={isActive}
      pulseTime={pulseTime}
      seats={seats}
      connections={connections}
      missedPulseDate={missedPulseDate}
      pendingRequests={pendingRequests}
      currentStreak={effectiveStreak}
      pulsedDates={pulsedDates}
      totalDays={totalDays}
      todayPulseDay={todayPulseDay}
    />
  );
}
