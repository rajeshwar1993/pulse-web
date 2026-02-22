import { PULSE_DAY_RESET_HOUR } from "@/lib/constants";
import { supabase } from "@/lib/supabase/client";

function getStartOfPulseDay(): Date {
  const now = new Date();
  const today4AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    PULSE_DAY_RESET_HOUR,
    0,
    0,
  );

  if (now < today4AM) {
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  }
  return today4AM;
}

export async function hasPulsedToday(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const pulseDayStart = getStartOfPulseDay();
  const { data } = await supabase
    .from("daily_pulses")
    .select("id")
    .eq("user_id", user.id)
    .gte("created_at", pulseDayStart.toISOString())
    .limit(1)
    .maybeSingle();

  return data !== null;
}

export async function sendPulse(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  if (await hasPulsedToday()) return false;

  const { error } = await supabase
    .from("daily_pulses")
    .insert({ user_id: user.id });

  return !error;
}
