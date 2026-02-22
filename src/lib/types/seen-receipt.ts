export interface SeenReceiptRow {
  id: string;
  viewer_id: string;
  viewed_user_id: string;
  pulse_date: string;
  seen_at: string;
  notification_sent_at: string | null;
}
