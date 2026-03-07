/**
 * Nuclear wipe — deletes ALL rows from all tables + all auth users.
 *
 * Table deletion order respects foreign key constraints:
 * 1. seen_receipts (FK → profiles)
 * 2. connection_seats (FK → connections, invite_codes, connection_requests, profiles)
 * 3. missed_pulses (FK → profiles)
 * 4. daily_pulses (FK → profiles)
 * 5. connections (FK → profiles)
 * 6. connection_requests (FK → profiles)
 * 7. invite_codes (FK → profiles)
 * 8. profiles (FK → auth.users)
 * 9. auth.users (via Admin API)
 */

import { deleteAllAuthUsers } from "./auth";
import { getAdmin } from "./client";
import { deleteAllConnectionRequests } from "./connection-requests";
import { deleteAllConnections } from "./connections";
import { deleteAllInviteCodes } from "./invites";
import { deleteAllProfiles } from "./profiles";
import { deleteAllPulses } from "./pulses";
import { deleteAllSeats } from "./seats";
import { deleteAllSeenReceipts } from "./seen-receipts";
import { deleteAllSurveys } from "./surveys";

async function deleteAllConnectionHistory(): Promise<void> {
  const { error } = await getAdmin()
    .from("connection_history")
    .delete()
    .neq("user_a_id", "00000000-0000-0000-0000-000000000000");
  if (error) console.warn(`[wipe] connection_history: ${error.message}`);
}

/**
 * Wipe ALL test data from all tables and auth users.
 * Call this in global-setup before creating seed users.
 */
export async function wipeAllData(): Promise<void> {
  console.log("[wipe] Deleting all data from all tables...");

  // Delete in FK-safe order (children first)
  await deleteAllSeenReceipts();
  await deleteAllSeats();
  await deleteAllConnectionHistory();
  await deleteAllSurveys();
  await deleteAllPulses();
  await deleteAllConnections();
  await deleteAllConnectionRequests();
  await deleteAllInviteCodes();
  await deleteAllProfiles();
  await deleteAllAuthUsers();

  console.log("[wipe] All data wiped successfully.");
}
