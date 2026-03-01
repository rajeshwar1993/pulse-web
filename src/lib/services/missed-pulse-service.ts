import { supabase } from "@/lib/supabase/client";
import type { MissedPulseResponse } from "@/lib/types/missed-pulse";

/**
 * Submit a missed-pulse survey response.
 * Uses upsert because the trigger may have auto-created the row with a NULL response.
 * Returns `true` on success, `false` on any error.
 */
export async function submitMissedPulseSurvey(
  missedDate: string,
  response: MissedPulseResponse,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("missed_pulses").upsert(
    {
      user_id: user.id,
      missed_date: missedDate,
      response,
    },
    { onConflict: "user_id,missed_date" },
  );

  return !error;
}
