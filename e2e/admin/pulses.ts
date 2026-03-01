/**
 * Pulse admin utilities — insert/query/delete daily_pulses.
 */
import { getAdmin } from "./client";

/**
 * Insert a pulse for a user (marks them as pulsed today).
 */
export async function insertPulse(userId: string): Promise<void> {
  const { error } = await getAdmin().from("daily_pulses").insert({
    user_id: userId,
  });
  if (error) throw new Error(`Failed to insert pulse: ${error.message}`);
}

/**
 * Insert a pulse at a specific date/time (for streak testing).
 */
export async function insertPulseAt(
  userId: string,
  createdAt: Date,
): Promise<void> {
  const { error } = await getAdmin().from("daily_pulses").insert({
    user_id: userId,
    created_at: createdAt.toISOString(),
  });
  if (error)
    throw new Error(`Failed to insert pulse at ${createdAt}: ${error.message}`);
}

/**
 * Get today's pulses for a user (since 4 AM local / UTC for tests).
 */
export async function getTodayPulses(userId: string) {
  const now = new Date();
  const resetHour = 4;
  const pulseStart = new Date(now);
  pulseStart.setHours(resetHour, 0, 0, 0);
  if (now.getHours() < resetHour) {
    pulseStart.setDate(pulseStart.getDate() - 1);
  }

  const { data, error } = await getAdmin()
    .from("daily_pulses")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", pulseStart.toISOString())
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to get pulses: ${error.message}`);
  return data;
}

/**
 * Delete all pulses for a specific user.
 */
export async function deleteUserPulses(userId: string): Promise<void> {
  const { error } = await getAdmin()
    .from("daily_pulses")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`Failed to delete pulses: ${error.message}`);
}

/**
 * Delete ALL pulses from all users.
 */
export async function deleteAllPulses(): Promise<void> {
  const { error } = await getAdmin()
    .from("daily_pulses")
    .delete()
    .neq("user_id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`Failed to delete all pulses: ${error.message}`);
}
