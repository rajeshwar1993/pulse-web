import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConnectionStats } from "@/lib/types/connection-detail";
import { getEffectiveStreak } from "@/lib/utils/streak";

/**
 * Fetch aggregated stats for a connection via the get_connection_stats RPC.
 * Returns null if the connection is not found or user is not authorized.
 */
export async function fetchConnectionStats(
  client: SupabaseClient,
  connectionId: string,
): Promise<ConnectionStats | null> {
  const { data, error } = await client.rpc("get_connection_stats", {
    p_connection_id: connectionId,
  });

  if (error || !data || data.length === 0) return null;

  const row = data[0];

  return {
    connectionCreatedAt: row.connection_created_at,
    totalDaysConnected: row.total_days_connected,
    daysBothPulsed: row.days_both_pulsed,
    syncRate: row.sync_rate,
    sharedStreakCurrent: row.shared_streak_current,
    sharedStreakLongest: row.shared_streak_longest,
    otherUserId: row.other_user_id,
    otherDisplayName: row.other_display_name,
    otherAvatarUrl: row.other_avatar_url,
    otherTimezone: row.other_timezone,
    otherCurrentStreak: getEffectiveStreak(
      row.other_current_streak ?? 0,
      row.other_last_pulse_date ?? null,
    ),
    otherLongestStreak: row.other_longest_streak,
    otherLastPulseDate: row.other_last_pulse_date,
  };
}
