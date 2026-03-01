/**
 * Seat admin utilities — query/cleanup on the connection_seats table.
 */
import { getAdmin } from "./client";

/**
 * Get seats for a user.
 */
export async function getUserSeats(userId: string) {
  const { data, error } = await getAdmin()
    .from("connection_seats")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to get seats: ${error.message}`);
  return data;
}

/**
 * Delete ALL seats.
 */
export async function deleteAllSeats(): Promise<void> {
  const { error } = await getAdmin()
    .from("connection_seats")
    .delete()
    .neq("owner_id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`Failed to delete all seats: ${error.message}`);
}
