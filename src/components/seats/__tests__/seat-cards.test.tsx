import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DashboardSeat } from "@/lib/types/seat";
import { EmptySeatCard } from "../empty-seat-card";
import { ExpiredSeatCard } from "../expired-seat-card";
import { PendingSeatCard } from "../pending-seat-card";
import { SeatCard } from "../seat-card";

vi.mock("next-intl", () => ({
  useTranslations:
    () => (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        addConnection: "Add Connection",
        inviteCodeShared: "Invite code shared",
        requestSent: "Request sent",
        tapToCancel: "Tap to cancel",
        seatLabel: "Seat {number}",
        expired: "Expired",
        tapToRenew: "Tap to renew",
        gridTitle: "Your Connections ({count})",
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

const emptySeat: DashboardSeat = {
  id: "seat-1",
  seatNumber: 1,
  state: "empty",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
};

const pendingSeatInvite: DashboardSeat = {
  id: "seat-2",
  seatNumber: 2,
  state: "pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  pendingInfo: {
    type: "invite_code",
    label: "ABC123",
    createdAt: new Date(),
  },
};

const pendingSeatRequest: DashboardSeat = {
  id: "seat-3",
  seatNumber: 3,
  state: "pending",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  pendingInfo: {
    type: "connection_request",
    label: "mom@example.com",
    createdAt: new Date(),
  },
};

const occupiedSeat: DashboardSeat = {
  id: "seat-4",
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
};

const expiredSeat: DashboardSeat = {
  id: "seat-5",
  seatNumber: 1,
  state: "expired",
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
};

const expiredSeatWithConnection: DashboardSeat = {
  id: "seat-6",
  seatNumber: 2,
  state: "expired",
  expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  connection: {
    id: "conn-2",
    userId: "user-003",
    name: "Dad",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    timezone: "Europe/London",
    status: "paused",
    pulseTime: null,
    currentStreak: 0,
  },
};

describe("EmptySeatCard", () => {
  it("renders add connection text", () => {
    render(<EmptySeatCard onClick={vi.fn()} />);
    expect(screen.getByText("Add Connection")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<EmptySeatCard onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders with dashed border", () => {
    const { container } = render(<EmptySeatCard onClick={vi.fn()} />);
    const button = container.querySelector(".border-dashed");
    expect(button).toBeInTheDocument();
  });
});

describe("PendingSeatCard", () => {
  it("shows invite code shared for invite_code type", () => {
    render(<PendingSeatCard seat={pendingSeatInvite} onClick={vi.fn()} />);
    expect(screen.getByText("Invite code shared")).toBeInTheDocument();
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("shows request sent for connection_request type", () => {
    render(<PendingSeatCard seat={pendingSeatRequest} onClick={vi.fn()} />);
    expect(screen.getByText("Request sent")).toBeInTheDocument();
    expect(screen.getByText("mom@example.com")).toBeInTheDocument();
  });

  it("shows tap to cancel hint", () => {
    render(<PendingSeatCard seat={pendingSeatInvite} onClick={vi.fn()} />);
    expect(screen.getByText("Tap to cancel")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<PendingSeatCard seat={pendingSeatInvite} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("ExpiredSeatCard", () => {
  it("shows expired badge", () => {
    render(<ExpiredSeatCard seat={expiredSeat} onClick={vi.fn()} />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("shows seat label with number", () => {
    render(<ExpiredSeatCard seat={expiredSeat} onClick={vi.fn()} />);
    expect(screen.getByText("Seat 1")).toBeInTheDocument();
  });

  it("shows tap to renew", () => {
    render(<ExpiredSeatCard seat={expiredSeat} onClick={vi.fn()} />);
    expect(screen.getByText("Tap to renew")).toBeInTheDocument();
  });

  it("shows connection name when seat has a connection", () => {
    render(
      <ExpiredSeatCard seat={expiredSeatWithConnection} onClick={vi.fn()} />,
    );
    expect(screen.getByText("Dad")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<ExpiredSeatCard seat={expiredSeat} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders with reduced opacity", () => {
    const { container } = render(
      <ExpiredSeatCard seat={expiredSeat} onClick={vi.fn()} />,
    );
    const button = container.querySelector(".opacity-60");
    expect(button).toBeInTheDocument();
  });
});

describe("SeatCard", () => {
  const handlers = {
    onEmptyClick: vi.fn(),
    onPendingClick: vi.fn(),
    onOccupiedClick: vi.fn(),
    onExpiredClick: vi.fn(),
  };

  it("renders EmptySeatCard for empty state", () => {
    render(<SeatCard seat={emptySeat} {...handlers} />);
    expect(screen.getByText("Add Connection")).toBeInTheDocument();
  });

  it("renders PendingSeatCard for pending state", () => {
    render(<SeatCard seat={pendingSeatInvite} {...handlers} />);
    expect(screen.getByText("Invite code shared")).toBeInTheDocument();
  });

  it("renders OccupiedSeatCard for occupied state", () => {
    render(<SeatCard seat={occupiedSeat} {...handlers} />);
    expect(screen.getByText("Mom")).toBeInTheDocument();
  });

  it("renders ExpiredSeatCard for expired state", () => {
    render(<SeatCard seat={expiredSeat} {...handlers} />);
    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("calls correct handler for empty seat click", () => {
    render(<SeatCard seat={emptySeat} {...handlers} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handlers.onEmptyClick).toHaveBeenCalledOnce();
  });

  it("calls correct handler for pending seat click", () => {
    render(<SeatCard seat={pendingSeatInvite} {...handlers} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handlers.onPendingClick).toHaveBeenCalledOnce();
  });

  it("calls correct handler for expired seat click", () => {
    render(<SeatCard seat={expiredSeat} {...handlers} />);
    fireEvent.click(screen.getByRole("button"));
    expect(handlers.onExpiredClick).toHaveBeenCalledOnce();
  });
});
