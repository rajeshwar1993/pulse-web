/** Raw database row from connection_seats table */
export interface Seat {
  id: string;
  owner_id: string;
  seat_number: number;
  expires_at: string;
  connection_id: string | null;
  invite_code_id: string | null;
  connection_request_id: string | null;
  created_at: string;
  renewed_at: string | null;
}

/** Derived seat state (computed on read, not stored) */
export type SeatState = "empty" | "pending" | "occupied" | "expired";

/** Display-oriented seat used by dashboard and connections pages */
export interface DashboardSeat {
  id: string;
  seatNumber: number;
  state: SeatState;
  expiresAt: Date;
  connection?: {
    id: string;
    userId: string;
    name: string;
    avatar: string;
    timezone: string;
    status: "active" | "paused" | "removed";
    pulseTime?: Date | null;
    currentStreak: number;
  };
  pendingInfo?: {
    type: "invite_code" | "connection_request";
    label: string;
    createdAt: Date;
  };
}
