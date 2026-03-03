import type { SupabaseClient } from "@supabase/supabase-js";
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
import {
  fetchConnectionsWithPulseStatus,
  toDashboardConnection,
} from "./connections";
import { fetchSeatsWithConnections } from "./seats";
import { fetchWisdomPhrases } from "./wisdom";

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
  wisdomPhrases: string[];
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

    const [ownSeats, allConnections] = await Promise.all([
      fetchSeatsWithConnections(supabase, userId),
      fetchConnectionsWithPulseStatus(supabase, userId),
    ]);

    // Connection IDs already represented by the user's own seats
    const seatedConnectionIds = new Set(
      ownSeats
        .filter((s) => s.state === "occupied" && s.connection != null)
        .map((s) => s.connection!.id),
    );

    // Create synthetic seats for received connections (not already in a seat)
    const syntheticSeats: DashboardSeat[] = allConnections
      .filter((conn) => !seatedConnectionIds.has(conn.id))
      .map((conn) => ({
        id: `received-${conn.id}`,
        seatNumber: 0,
        state: "occupied" as const,
        expiresAt: new Date("9999-12-31"),
        connection: {
          id: conn.id,
          userId: conn.user_id,
          name: conn.display_name,
          avatar: conn.avatar_url,
          timezone: conn.timezone,
          status: "active" as const,
          pulseTime: conn.last_pulse ? new Date(conn.last_pulse) : null,
          currentStreak: conn.current_streak,
        },
      }));

    seats = [...ownSeats, ...syntheticSeats];
    connections = allConnections.map(toDashboardConnection);
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

  const { data: pulsedDatesData } = await supabase.rpc("get_pulsed_dates", {
    p_days: 12,
  });
  const pulsedDates: string[] = (pulsedDatesData ?? []).map(String);

  // --- Missed pulse survey detection ---
  // Check if yesterday has an unresponded miss (auto-recorded by trigger)
  let missedPulseDate: string | null = null;
  const today = new Date(`${todayPulseDay}T00:00:00`);
  const yesterdayPulseDay = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yStr = `${yesterdayPulseDay.getFullYear()}-${String(yesterdayPulseDay.getMonth() + 1).padStart(2, "0")}-${String(yesterdayPulseDay.getDate()).padStart(2, "0")}`;

  const { data: unrespondedMiss } = await supabase
    .from("missed_pulses")
    .select("id")
    .eq("user_id", userId)
    .eq("missed_date", yStr)
    .is("response", null)
    .maybeSingle();

  if (unrespondedMiss) {
    missedPulseDate = yStr;
  }

  // --- Wisdom phrases ---
  const wisdomPhrases = await fetchWisdomPhrases(supabase);

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
    wisdomPhrases,
  };
}
