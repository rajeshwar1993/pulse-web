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
    timezone: "America/New_York",
    status: "active",
    pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    currentStreak: 7,
    longestStreak: 14,
  },
  {
    id: "conn-2",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    name: "Dad",
    timezone: "Europe/London",
    status: "waiting",
    pulseTime: null,
    currentStreak: 0,
    longestStreak: 3,
  },
  {
    id: "conn-3",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
    name: "Sibling",
    timezone: "Asia/Tokyo",
    status: "active",
    pulseTime: new Date(Date.now() - 30 * 60 * 1000),
    currentStreak: 21,
    longestStreak: 21,
  },
];

/** Generate mock pulsed dates for Ghost Calendar stories. */
function generateMockPulsedDates(
  pattern: "streak" | "scattered" | "empty",
): string[] {
  const today = new Date();
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (pattern === "empty") return [];

  if (pattern === "streak") {
    // Last 14 consecutive days pulsed
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return fmt(d);
    });
  }

  // Scattered: ~60% of days pulsed, with some gaps
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    if (i % 5 !== 3 && i % 7 !== 0) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(fmt(d));
    }
  }
  return dates;
}

export const mockPulsedDatesStreak = generateMockPulsedDates("streak");
export const mockPulsedDatesScattered = generateMockPulsedDates("scattered");
export const mockPulsedDatesEmpty = generateMockPulsedDates("empty");

export const mockConnectionsWithProfile: ConnectionWithProfile[] = [
  {
    id: "conn-1",
    user_id: "user-002",
    display_name: "Mom",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=aneka",
    timezone: "America/New_York",
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
    timezone: "Europe/London",
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
    timezone: "Asia/Tokyo",
    status: "active",
    last_pulse: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    created_at: "2025-01-03T00:00:00Z",
    current_streak: 21,
    longest_streak: 21,
  },
];
