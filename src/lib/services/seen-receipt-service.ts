import { supabase } from "@/lib/supabase/client";
import { logger } from "@/lib/utils/logger";

/**
 * Record seen receipts for all viewed users on a given pulse day.
 * Uses upsert with onConflict for deduplication — safe to call multiple times.
 * Returns `true` on success, `false` on error (fire-and-forget).
 */
export async function recordSeenReceipts(
  viewedUserIds: string[],
  pulseDate: string,
): Promise<boolean> {
  if (viewedUserIds.length === 0) return true;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    logger.warn("recordSeenReceipts: no authenticated user");
    return false;
  }

  const rows = viewedUserIds.map((viewedUserId) => ({
    viewer_id: user.id,
    viewed_user_id: viewedUserId,
    pulse_date: pulseDate,
  }));

  const { error } = await supabase
    .from("seen_receipts")
    .upsert(rows, { onConflict: "viewer_id,viewed_user_id,pulse_date" });

  if (error) {
    logger.error("recordSeenReceipts: upsert failed", error);
    return false;
  }

  return true;
}
