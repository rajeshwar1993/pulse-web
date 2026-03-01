import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardContent } from "../dashboard-content";

// Mock child components to isolate unit tests
vi.mock("../wisdom-card", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  WisdomCard: (props: any) => (
    <div data-testid="wisdom-card" data-auto-dismiss={props.autoDismiss} />
  ),
}));

vi.mock("../status-card", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  StatusCard: (props: any) => (
    <div data-testid="status-card" data-active={props.isActive} />
  ),
}));

vi.mock("../streak-card", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  StreakCard: (props: any) => (
    <div data-testid="streak-card" data-streak={props.currentStreak} />
  ),
}));

vi.mock("@/components/seats/seat-grid", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  SeatGrid: (props: any) => (
    <div data-testid="seat-grid" data-count={props.seats.length} />
  ),
}));

vi.mock("../missed-pulse-survey-modal", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  MissedPulseSurveyModal: (props: any) => (
    <div data-testid="missed-pulse-survey-modal" data-date={props.missedDate} />
  ),
}));

vi.mock("@/components/seats/cancel-invite-modal", () => ({
  CancelInviteModal: () => null,
}));

vi.mock("@/components/seats/renew-seat-modal", () => ({
  RenewSeatModal: () => null,
}));

vi.mock("@/components/connections/invite-modal", () => ({
  InviteModal: () => null,
}));

vi.mock("@/lib/services/connection-service", () => ({
  ConnectionService: { removeConnection: vi.fn() },
}));

vi.mock("@/components/providers/toast-provider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const mockUseSeenReceipts = vi.fn();
vi.mock("@/hooks/use-seen-receipts", () => ({
  useSeenReceipts: (...args: unknown[]) => mockUseSeenReceipts(...args),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      activeSubtitle: "You're all set for today.",
      inactiveSubtitle: "Welcome back!",
    };
    return translations[key] || key;
  },
}));

const baseProps = {
  displayName: "Alice",
  isActive: true,
  seats: [] as import("@/lib/types/seat").DashboardSeat[],
  connections: [] as import("@/lib/types/connection").DashboardConnection[],
  pulseTime: null,
  currentStreak: 3,
  pulsedDates: ["2026-02-24", "2026-02-25", "2026-02-26"],
  totalDays: 15,
  todayPulseDay: "2026-02-26",
};

describe("DashboardContent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Stub FlutterBridge so the useEffect doesn't error
    // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
    (window as any).FlutterBridge = { postMessage: vi.fn() };
  });

  afterEach(() => {
    vi.useRealTimers();
    // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
    delete (window as any).FlutterBridge;
  });

  it("should render morning greeting before noon", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0)); // 9 AM
    render(<DashboardContent {...baseProps} />);

    expect(screen.getByText(/Good morning, Alice!/)).toBeInTheDocument();
  });

  it("should render afternoon greeting between noon and 6 PM", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 14, 0)); // 2 PM
    render(<DashboardContent {...baseProps} />);

    expect(screen.getByText(/Good afternoon, Alice!/)).toBeInTheDocument();
  });

  it("should render evening greeting after 6 PM", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 20, 0)); // 8 PM
    render(<DashboardContent {...baseProps} />);

    expect(screen.getByText(/Good evening, Alice!/)).toBeInTheDocument();
  });

  it("should show active subtitle when isActive is true", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} isActive={true} />);

    expect(screen.getByText("You're all set for today.")).toBeInTheDocument();
  });

  it("should show inactive subtitle when isActive is false", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} isActive={false} />);

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
  });

  it("should render WisdomCard when showWisdom is true", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} showWisdom={true} />);

    expect(screen.getByTestId("wisdom-card")).toBeInTheDocument();
  });

  it("should not render WisdomCard when showWisdom is false", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} showWisdom={false} />);

    expect(screen.queryByTestId("wisdom-card")).not.toBeInTheDocument();
  });

  it("should render StatusCard", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} />);

    expect(screen.getByTestId("status-card")).toBeInTheDocument();
  });

  it("should render SeatGrid with empty seats", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} seats={[]} />);

    expect(screen.getByTestId("seat-grid")).toBeInTheDocument();
  });

  it("should render SeatGrid with seats", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    const seats: import("@/lib/types/seat").DashboardSeat[] = [
      {
        id: "seat-1",
        seatNumber: 1,
        state: "occupied",
        expiresAt: new Date("2026-03-01"),
        connection: {
          id: "conn-1",
          userId: "user-456",
          name: "Bob",
          avatar: "/a.png",
          timezone: "America/New_York",
          status: "active",
          pulseTime: null,
          currentStreak: 3,
        },
      },
    ];
    render(<DashboardContent {...baseProps} seats={seats} />);

    expect(screen.getByTestId("seat-grid")).toBeInTheDocument();
  });

  it("should send FlutterBridge ready signal", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    const postMessage = vi.fn();
    // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
    (window as any).FlutterBridge = { postMessage };

    render(<DashboardContent {...baseProps} />);

    // Advance past the 500ms delay
    vi.advanceTimersByTime(600);

    expect(postMessage).toHaveBeenCalledOnce();
    const message = JSON.parse(postMessage.mock.calls[0][0]);
    expect(message.type).toBe("ready");
    expect(message.timestamp).toBeDefined();
  });

  it("should not throw when FlutterBridge is absent", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
    delete (window as any).FlutterBridge;

    expect(() => {
      render(<DashboardContent {...baseProps} />);
      vi.advanceTimersByTime(600);
    }).not.toThrow();
  });

  it("should show missed pulse survey modal when missedPulseDate is provided", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} missedPulseDate="2026-02-21" />);

    expect(screen.getByTestId("missed-pulse-survey-modal")).toBeInTheDocument();
  });

  it("should not show missed pulse survey modal when missedPulseDate is null", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} missedPulseDate={null} />);

    expect(
      screen.queryByTestId("missed-pulse-survey-modal"),
    ).not.toBeInTheDocument();
  });

  it("should call useSeenReceipts with connections", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    const connections: import("@/lib/types/connection").DashboardConnection[] =
      [
        {
          id: "1",
          userId: "user-456",
          avatar: "/a.png",
          name: "Bob",
          timezone: "America/New_York",
          status: "active" as const,
          pulseTime: null,
          currentStreak: 3,
          longestStreak: 5,
        },
      ];
    render(<DashboardContent {...baseProps} connections={connections} />);

    expect(mockUseSeenReceipts).toHaveBeenCalledWith(connections);
  });
});
