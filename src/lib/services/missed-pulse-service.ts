import { supabase } from "@/lib/supabase/client";
import type { MissedPulseResponse } from "@/lib/types/missed-pulse-survey";

/**
 * Submit a missed-pulse survey response.
 * Returns `true` on success, `false` on any error (including duplicates).
 */
export async function submitMissedPulseSurvey(
  missedDate: string,
  response: MissedPulseResponse,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("missed_pulse_surveys").insert({
    user_id: user.id,
    missed_date: missedDate,
    response,
  });

  return !error;
}
