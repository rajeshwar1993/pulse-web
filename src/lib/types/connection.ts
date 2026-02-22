export interface Connection {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
  removed_at: string | null;
  removed_by: string | null;
  from_profile?: Profile;
  to_profile?: Profile;
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
  status: "active" | "waiting";
  last_pulse?: string;
  created_at: string;
}

/** Display-oriented connection used in the dashboard view */
export interface DashboardConnection {
  id: string;
  avatar: string;
  name: string;
  status: "active" | "waiting";
  pulseTime?: Date | null;
}
