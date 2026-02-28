import type { SupabaseClient } from "@supabase/supabase-js";
import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";
import type {
  ConnectionRequestWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";
import {
  getEffectiveStreak,
  getPulseDayDate,
  getStartOfPulseDay,
  getTodayPulseDay,
} from "@/lib/utils/streak";
import { fetchSeatsWithConnections } from "./seats";

export interface DashboardData {
  displayName: string;
  isActive: boolean;
  pulseTime: Date | null;
  seats: DashboardSeat[];
  connections: DashboardConnection[];
  missedPulseDate: string | null;
  pendingRequests: ConnectionRequestWithProfile[];
  currentStreak: number;
  pulsedDates: string[];
  totalDays: number;
  todayPulseDay: string;
}

/**
 * Fetches all data needed by the dashboard.
 *
 * Shared between appview and browser dashboard pages to eliminate duplication.
 * The caller must already have verified that `user` and `profile` exist.
 */
export async function fetchDashboardData(
  supabase: SupabaseClient,
  userId: string,
  profile: {
    display_name: string;
    current_streak: number | null;
    longest_streak: number;
    last_pulse_date: string | null;
    created_at: string;
  },
): Promise<DashboardData> {
  // Check if user has pulsed today
  const pulseDayStart = getStartOfPulseDay();
  const { data: todayPulse } = await supabase
    .from("daily_pulses")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", pulseDayStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const isActive = todayPulse !== null;
  const pulseTime = todayPulse?.created_at
    ? new Date(todayPulse.created_at)
    : null;

  // Fetch seats with connections (graceful fallback if seat system unavailable)
  let seats: DashboardSeat[] = [];
  let connections: DashboardConnection[] = [];
  try {
    await supabase.rpc("enforce_seat_expirations", { p_user_id: userId });

    seats = await fetchSeatsWithConnections(supabase, userId);

    connections = seats
      .filter(
        (s): s is typeof s & { connection: NonNullable<typeof s.connection> } =>
          s.state === "occupied" && s.connection != null,
      )
      .map((s) => ({
        id: s.connection.id,
        userId: s.connection.userId,
        avatar: s.connection.avatar,
        name: s.connection.name,
        timezone: s.connection.timezone,
        status: s.connection.pulseTime
          ? ("active" as const)
          : ("waiting" as const),
        pulseTime: s.connection.pulseTime,
        currentStreak: s.connection.currentStreak,
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
    .eq("user_id", userId)
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
        .eq("user_id", userId)
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
    .eq("to_user_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingRequests =
    (pendingRequestsData as unknown as ConnectionRequestWithProfile[]) ?? [];

  return {
    displayName: profile.display_name,
    isActive,
    pulseTime,
    seats,
    connections,
    missedPulseDate,
    pendingRequests,
    currentStreak: effectiveStreak,
    pulsedDates,
    totalDays,
    todayPulseDay,
  };
}
