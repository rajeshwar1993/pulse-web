import type {
  ConnectionWithProfile,
  DashboardConnection,
} from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";

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
    userId: "user-002",
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
    userId: "user-003",
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
    userId: "user-004",
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

export const mockSeats: DashboardSeat[] = [
  {
    id: "seat-1",
    seatNumber: 1,
    state: "occupied",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    connection: {
      id: "conn-1",
      userId: "user-002",
      name: "Mom",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aneka",
      timezone: "America/New_York",
      status: "active",
      pulseTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      currentStreak: 7,
    },
  },
  {
    id: "seat-2",
    seatNumber: 2,
    state: "occupied",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    connection: {
      id: "conn-2",
      userId: "user-003",
      name: "Dad",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
      timezone: "Europe/London",
      status: "active",
      pulseTime: null,
      currentStreak: 0,
    },
  },
  {
    id: "seat-3",
    seatNumber: 3,
    state: "occupied",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    connection: {
      id: "conn-3",
      userId: "user-004",
      name: "Sibling",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=charlie",
      timezone: "Asia/Tokyo",
      status: "active",
      pulseTime: new Date(Date.now() - 30 * 60 * 1000),
      currentStreak: 21,
    },
  },
];

export const mockSeatsEmpty: DashboardSeat[] = [
  {
    id: "seat-1",
    seatNumber: 1,
    state: "empty",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "seat-2",
    seatNumber: 2,
    state: "empty",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "seat-3",
    seatNumber: 3,
    state: "empty",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
];

export const mockSeatPending: DashboardSeat = {
  id: "seat-pending-1",
  seatNumber: 1,
  state: "pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  pendingInfo: {
    type: "invite_code",
    label: "ABC123",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
};

export const mockSeatPendingRequest: DashboardSeat = {
  id: "seat-pending-2",
  seatNumber: 2,
  state: "pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  pendingInfo: {
    type: "connection_request",
    label: "mom@example.com",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
};

export const mockSeatExpired: DashboardSeat = {
  id: "seat-expired-1",
  seatNumber: 1,
  state: "expired",
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
};

export const mockSeatExpiredWithConnection: DashboardSeat = {
  id: "seat-expired-2",
  seatNumber: 2,
  state: "expired",
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  connection: {
    id: "conn-1",
    userId: "user-002",
    name: "Mom",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aneka",
    timezone: "America/New_York",
    status: "paused",
    pulseTime: null,
    currentStreak: 0,
  },
};

export const mockSeatOccupiedPaused: DashboardSeat = {
  id: "seat-paused-1",
  seatNumber: 1,
  state: "occupied",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  connection: {
    id: "conn-paused",
    userId: "user-005",
    name: "Friend",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=friend",
    timezone: "America/Chicago",
    status: "paused",
    pulseTime: null,
    currentStreak: 0,
  },
};

export const mockSeatsMixed: DashboardSeat[] = [
  mockSeats[0],
  mockSeatPending,
  mockSeatExpired,
];

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
