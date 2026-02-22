/** Valid responses for the missed-pulse micro-survey. */
export type MissedPulseResponse =
  | "forgot"
  | "busy"
  | "tech_issue"
  | "not_feeling_it"
  | "skipped";

/** Row shape returned from the `missed_pulse_surveys` table. */
export interface MissedPulseSurveyRow {
  id: string;
  user_id: string;
  missed_date: string;
  response: MissedPulseResponse;
  created_at: string;
}
