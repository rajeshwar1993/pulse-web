export interface Connection {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  removed_at: string | null;
  removed_by: string | null;
  status: "active" | "paused" | "removed";
}

export interface InviteCode {
  id: string;
  code: string;
  creator_id: string;
  created_at: string;
  expires_at: string;
  accepted_by: string | null;
  accepted_at: string | null;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string;
}

export interface ConnectionWithProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string;
  timezone: string;
  status: "active" | "waiting";
  last_pulse?: string;
  created_at: string;
  current_streak: number;
  longest_streak: number;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  responded_at: string | null;
}

export interface ConnectionRequestWithProfile extends ConnectionRequest {
  from_profile: {
    id: string;
    display_name: string;
    avatar_url: string;
  };
}

/** Display-oriented connection used in the dashboard view */
export interface DashboardConnection {
  id: string;
  userId: string;
  avatar: string;
  name: string;
  timezone: string;
  status: "active" | "waiting";
  pulseTime?: Date | null;
  currentStreak: number;
  longestStreak: number;
}
