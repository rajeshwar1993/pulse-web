import type {
  ConnectionWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";

export const mockUser = {
  id: "user-001",
  email: "alice@example.com",
};

export const mockProfile = {
  id: "user-001",
  display_name: "Alice",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=felix",
};

export const mockConnections: DashboardConnection[] = [
  {
    id: "conn-1",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aneka",
    name: "Mom",
    status: "active",
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentStreak: 7,
    longestStreak: 14,
  },
  {
    id: "conn-2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    name: "Dad",
    status: "waiting",
    pulseTime: null,
    currentStreak: 0,
    longestStreak: 3,
  },
  {
    id: "conn-3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    name: "Sibling",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    currentStreak: 21,
    longestStreak: 21,
  },
];

export const mockConnectionsWithProfile: ConnectionWithProfile[] = [
  {
    id: "conn-1",
    user_id: "user-002",
    display_name: "Mom",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=aneka",
    status: "active",
    last_pulse: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_at: "2025-01-01T00:00:00Z",
    current_streak: 7,
    longest_streak: 14,
  },
  {
    id: "conn-2",
    user_id: "user-003",
    display_name: "Dad",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    status: "waiting",
    created_at: "2025-01-02T00:00:00Z",
    current_streak: 0,
    longest_streak: 3,
  },
  {
    id: "conn-3",
    user_id: "user-004",
    display_name: "Sibling",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    status: "active",
    last_pulse: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: "2025-01-03T00:00:00Z",
    current_streak: 21,
    longest_streak: 21,
  },
];
