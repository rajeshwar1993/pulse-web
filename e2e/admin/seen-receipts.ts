/**
 * Seen receipts admin utilities.
 */
import { getAdmin } from "./client";

/**
 * Delete ALL seen receipts.
 */
export async function deleteAllSeenReceipts(): Promise<void> {
  const { error } = await getAdmin()
    .from("seen_receipts")
    .delete()
    .neq("viewer_id", "00000000-0000-0000-0000-000000000000");
  if (error)
    throw new Error(`Failed to delete all seen receipts: ${error.message}`);
}
