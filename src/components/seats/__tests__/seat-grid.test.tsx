import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DashboardSeat } from "@/lib/types/seat";
import { SeatGrid } from "../seat-grid";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      gridTitle: "Your Connections ({count})",
      addConnection: "Add Connection",
      inviteCodeShared: "Invite code shared",
      tapToCancel: "Tap to cancel",
      seatLabel: "Seat {number}",
      expired: "Expired",
      tapToRenew: "Tap to renew",
    };
    let result = translations[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  },
  useLocale: () => "en",
}));

vi.mock("@/hooks/use-partner-time", () => ({
  usePartnerTime: () => "3:30 PM",
}));

vi.mock("@/lib/utils/format-date", () => ({
  formatRelativeTime: () => "2 hours ago",
}));

vi.mock("@/lib/utils/timezone", () => ({
  getWaitingContext: () => "afternoon",
}));

const emptySeats: DashboardSeat[] = [
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

const occupiedSeats: DashboardSeat[] = [
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
];

describe("SeatGrid", () => {
  const handlers = {
    onEmptyClick: vi.fn(),
    onPendingClick: vi.fn(),
    onOccupiedClick: vi.fn(),
    onExpiredClick: vi.fn(),
  };

  it("shows correct occupied count in title", () => {
    render(<SeatGrid seats={occupiedSeats} {...handlers} />);
    expect(screen.getByText("Your Connections (2)")).toBeInTheDocument();
  });

  it("shows zero count when all seats are empty", () => {
    render(<SeatGrid seats={emptySeats} {...handlers} />);
    expect(screen.getByText("Your Connections (0)")).toBeInTheDocument();
  });

  it("renders all seat cards", () => {
    render(<SeatGrid seats={emptySeats} {...handlers} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });

  it("renders connection names for occupied seats", () => {
    render(<SeatGrid seats={occupiedSeats} {...handlers} />);
    expect(screen.getByText("Mom")).toBeInTheDocument();
    expect(screen.getByText("Dad")).toBeInTheDocument();
  });

  it("calls onEmptyClick with the correct seat", () => {
    render(<SeatGrid seats={emptySeats} {...handlers} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(handlers.onEmptyClick).toHaveBeenCalledWith(emptySeats[0]);
  });
});
