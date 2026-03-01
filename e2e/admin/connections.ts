/**
 * Connection admin utilities — CRUD on the connections table.
 *
 * The connections table uses canonical UUID ordering:
 * user_a_id < user_b_id (single row per relationship).
 */
import { getAdmin } from "./client";

/**
 * Compute canonical ordering for two user IDs.
 */
function canonical(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

/**
 * Create a connection between two users (canonical single-row).
 */
export async function createConnection(
  userId1: string,
  userId2: string,
): Promise<void> {
  const [a, b] = canonical(userId1, userId2);
  const { error } = await getAdmin().from("connections").insert({
    user_a_id: a,
    user_b_id: b,
  });
  if (error) throw new Error(`Failed to create connection: ${error.message}`);
}

/**
 * Get active (non-removed) connections for a user.
 */
export async function getActiveConnections(userId: string) {
  const { data, error } = await getAdmin()
    .from("connections")
    .select("*")
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .is("removed_at", null);
  if (error) throw new Error(`Failed to get connections: ${error.message}`);
  return data;
}

/**
 * Delete all connections involving a specific user.
 */
export async function deleteUserConnections(userId: string): Promise<void> {
  const { error } = await getAdmin()
    .from("connections")
    .delete()
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);
  if (error) throw new Error(`Failed to delete connections: ${error.message}`);
}

/**
 * Delete ALL connections.
 */
export async function deleteAllConnections(): Promise<void> {
  const { error } = await getAdmin()
    .from("connections")
    .delete()
    .neq("user_a_id", "00000000-0000-0000-0000-000000000000");
  if (error)
    throw new Error(`Failed to delete all connections: ${error.message}`);
}
