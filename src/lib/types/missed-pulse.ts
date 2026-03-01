/** Valid responses for the missed-pulse micro-survey. */
export type MissedPulseResponse =
  | "forgot"
  | "busy"
  | "tech_issue"
  | "not_feeling_it"
  | "skipped";

/** Row shape returned from the `missed_pulses` table. */
export interface MissedPulseRow {
  id: string;
  user_id: string;
  missed_date: string;
  response: MissedPulseResponse | null;
  created_at: string;
}
