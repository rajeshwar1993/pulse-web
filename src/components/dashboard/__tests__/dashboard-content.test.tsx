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

vi.mock("../connection-grid", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  ConnectionGrid: (props: any) => (
    <div data-testid="connection-grid" data-count={props.connections.length} />
  ),
}));

vi.mock("../streak-badge", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  StreakBadge: (props: any) => (
    <div
      data-testid="streak-badge"
      data-current={props.currentStreak}
      data-longest={props.longestStreak}
    />
  ),
}));

vi.mock("../ghost-calendar", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  GhostCalendar: (props: any) => (
    <div
      data-testid="ghost-calendar"
      data-dates={props.pulsedDates?.length ?? 0}
    />
  ),
}));

vi.mock("@/components/shared/empty-connections-view", () => ({
  EmptyConnectionsView: () => <div data-testid="empty-connections" />,
}));

vi.mock("next/link", () => ({
  // biome-ignore lint/suspicious/noExplicitAny: test mock props
  default: ({ children, href, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      greetingMorning: "Good morning",
      greetingAfternoon: "Good afternoon",
      greetingEvening: "Good evening",
      activeSubtitle: "You're all set for today.",
      inactiveSubtitle: "Welcome back!",
      settingsAriaLabel: "Settings",
    };
    return translations[key] || key;
  },
}));

const baseProps = {
  displayName: "Alice",
  isActive: true,
  connections: [],
  pulseTime: null,
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

  it("should render StreakBadge with default values", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} />);

    const badge = screen.getByTestId("streak-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-current", "0");
    expect(badge).toHaveAttribute("data-longest", "0");
  });

  it("should pass streak values to StreakBadge", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(
      <DashboardContent
        {...baseProps}
        currentStreak={7}
        longestStreak={14}
      />,
    );

    const badge = screen.getByTestId("streak-badge");
    expect(badge).toHaveAttribute("data-current", "7");
    expect(badge).toHaveAttribute("data-longest", "14");
  });

  it("should render EmptyConnectionsView when no connections", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} connections={[]} />);

    expect(screen.getByTestId("empty-connections")).toBeInTheDocument();
    expect(screen.queryByTestId("connection-grid")).not.toBeInTheDocument();
  });

  it("should render ConnectionGrid when connections exist", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    const connections = [
      {
        id: "1",
        avatar: "/a.png",
        name: "Bob",
        status: "active" as const,
        pulseTime: null,
        currentStreak: 3,
        longestStreak: 5,
      },
    ];
    render(<DashboardContent {...baseProps} connections={connections} />);

    expect(screen.getByTestId("connection-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("empty-connections")).not.toBeInTheDocument();
  });

  it("should render settings link", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 9, 0));
    render(<DashboardContent {...baseProps} />);

    const settingsLink = screen.getByRole("link", { name: /settings/i });
    expect(settingsLink).toHaveAttribute("href", "/appview/settings");
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
});
