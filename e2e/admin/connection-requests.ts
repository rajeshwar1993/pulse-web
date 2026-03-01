/**
 * Connection request admin utilities.
 */
import { getAdmin } from "./client";

/**
 * Create a connection request.
 */
export async function createConnectionRequest(
  fromUserId: string,
  toUserId: string,
): Promise<void> {
  const { error } = await getAdmin().from("connection_requests").insert({
    from_user_id: fromUserId,
    to_user_id: toUserId,
    status: "pending",
  });
  if (error)
    throw new Error(`Failed to create connection request: ${error.message}`);
}

/**
 * Get pending connection requests for a user (as recipient).
 */
export async function getPendingRequests(userId: string) {
  const { data, error } = await getAdmin()
    .from("connection_requests")
    .select("*")
    .eq("to_user_id", userId)
    .eq("status", "pending");
  if (error)
    throw new Error(`Failed to get pending requests: ${error.message}`);
  return data;
}

/**
 * Delete ALL connection requests.
 */
export async function deleteAllConnectionRequests(): Promise<void> {
  const { error } = await getAdmin()
    .from("connection_requests")
    .delete()
    .neq("from_user_id", "00000000-0000-0000-0000-000000000000");
  if (error)
    throw new Error(
      `Failed to delete all connection requests: ${error.message}`,
    );
}
