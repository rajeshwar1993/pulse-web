import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConnectionWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import { getEffectiveStreak, getStartOfPulseDay } from "@/lib/utils/streak";

/**
 * Fetch connections with pulse status for the given user.
 * Works with any Supabase client (server or browser).
 */
export async function fetchConnectionsWithPulseStatus(
  client: SupabaseClient,
  userId: string,
): Promise<ConnectionWithProfile[]> {
  const { data: connectionsData, error } = await client
    .from("connections")
    .select(
      `
      id, user_a_id, user_b_id, created_at,
      user_a_profile:profiles!connections_user_a_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date),
      user_b_profile:profiles!connections_user_b_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date)
    `,
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .is("removed_at", null)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!connectionsData) return [];

  // Get connected user IDs, fetch today's pulses in one batch
  const pulseDayStart = getStartOfPulseDay();

  // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
  const connectedUserIds = connectionsData.map((c: any) =>
    c.user_a_id === userId ? c.user_b_id : c.user_a_id,
  );

  const { data: todayPulses } =
    connectedUserIds.length > 0
      ? await client
          .from("daily_pulses")
          .select("user_id, created_at")
          .in("user_id", connectedUserIds)
          .gte("created_at", pulseDayStart.toISOString())
      : { data: [] };

  const pulseMap = new Map(
    (todayPulses ?? []).map((p) => [p.user_id, p.created_at]),
  );

  // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
  return connectionsData.map((conn: any) => {
    const other =
      conn.user_a_id === userId ? conn.user_b_profile : conn.user_a_profile;
    const pulseCreatedAt = pulseMap.get(other.id);
    return {
      id: conn.id,
      user_id: other.id,
      display_name: other.display_name,
      avatar_url: other.avatar_url,
      timezone: other.timezone ?? "UTC",
      status: pulseCreatedAt ? ("active" as const) : ("waiting" as const),
      last_pulse: pulseCreatedAt ?? undefined,
      created_at: conn.created_at,
      current_streak: getEffectiveStreak(
        other.current_streak ?? 0,
        other.last_pulse_date ?? null,
      ),
      longest_streak: other.longest_streak ?? 0,
    };
  });
}

/**
 * Map a ConnectionWithProfile to a DashboardConnection (camelCase, Date pulseTime).
 */
export function toDashboardConnection(
  conn: ConnectionWithProfile,
): DashboardConnection {
  return {
    id: conn.id,
    userId: conn.user_id,
    avatar: conn.avatar_url,
    name: conn.display_name,
    timezone: conn.timezone,
    status: conn.status,
    pulseTime: conn.last_pulse ? new Date(conn.last_pulse) : null,
    currentStreak: conn.current_streak,
    longestStreak: conn.longest_streak,
  };
}
