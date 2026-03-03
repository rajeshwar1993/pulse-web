import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserDashboardClient } from "../page-client";

// --- Mocks ---

const mockRefresh = vi.fn();
const mockRouter = { refresh: mockRefresh };
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

const mockShowToast = vi.fn();
vi.mock("@/components/providers/toast-provider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      sendPulse: "Send Pulse",
      sending: "Sending...",
      sent: "Pulse sent!",
      alreadySent: "You've already pulsed today",
    };
    return translations[key] || key;
  },
}));

vi.mock("@/lib/services/wisdom-service", () => ({
  getRandomWisdomIndex: () => 0,
}));

const mockSendPulse = vi.fn<() => Promise<boolean>>();
vi.mock("@/lib/services/pulse-service", () => ({
  sendPulse: () => mockSendPulse(),
}));

// Mock useTransition to avoid scheduler issues with fake timers.
// React's scheduler uses MessageChannel (not intercepted by fake timers),
// causing act() to hang waiting for the transition to complete.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  // Stable reference so useEffect dependency doesn't change between renders
  const stableStartTransition = (fn: () => void) => fn();
  return {
    ...actual,
    useTransition: () =>
      [false, stableStartTransition] as [
        boolean,
        (fn: () => void) => void,
      ],
  };
});

// Mock framer-motion: render children synchronously, track onExitComplete
let exitCompleteCallback: (() => void) | undefined;

vi.mock("framer-motion", () => ({
  AnimatePresence: ({
    children,
    onExitComplete,
  }: {
    children: React.ReactNode;
    onExitComplete?: () => void;
  }) => {
    exitCompleteCallback = onExitComplete;
    return <>{children}</>;
  },
  motion: {
    div: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...rest}>
        {children}
      </div>
    ),
    p: ({
      children,
      className,
      ...rest
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className} {...rest}>
        {children}
      </p>
    ),
  },
}));

// Mock child components to keep tests focused
vi.mock("@/components/dashboard/dashboard-content", () => ({
  DashboardContent: (props: { onPulse?: () => Promise<void> }) => (
    <div data-testid="dashboard-content">
      {props.onPulse && (
        <button type="button" onClick={props.onPulse} data-testid="pulse-btn">
          Send Pulse
        </button>
      )}
    </div>
  ),
}));

const testPhrases = ["Test wisdom phrase", "Another wisdom phrase"];

const baseProps = {
  displayName: "Alice",
  isActive: false,
  pulseTime: null,
  seats: [] as import("@/lib/types/seat").DashboardSeat[],
  connections: [] as import("@/lib/types/connection").DashboardConnection[],
  missedPulseDate: null,
  pendingRequests:
    [] as import("@/lib/types/connection").ConnectionRequestWithProfile[],
  currentStreak: 0,
  pulsedDates: [] as string[],
  totalDays: 10,
  todayPulseDay: "2026-03-01",
  wisdomPhrases: testPhrases,
};

describe("BrowserDashboardClient – pulse overlay", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    exitCompleteCallback = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should show pulse overlay when pulse button is clicked", async () => {
    mockSendPulse.mockReturnValue(new Promise(() => {})); // never resolves

    const { container } = render(<BrowserDashboardClient {...baseProps} />);

    expect(container.querySelector(".animate-heartbeat")).not.toBeInTheDocument();

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    expect(container.querySelector(".animate-heartbeat")).toBeInTheDocument();
  });

  it("should show wisdom at 1.5s then exit after 4s", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // Let promise resolve
    await act(async () => {
      await Promise.resolve();
    });

    // No wisdom yet
    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();

    // Advance past 1.5s — wisdom should appear
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();

    // Advance to 4s total — overlay should exit
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();
  });

  it("should show wisdom after 1.5s even if pulseResult is slow", async () => {
    mockSendPulse.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 10000)),
    );

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // No text initially
    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();

    // Advance past 1.5s
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    // Wisdom should appear
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();
  });

  it("should call router.refresh during overlay display on success", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // Let promise resolve — refresh should be triggered immediately
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it("should show success toast after overlay exit on success", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // Let promise resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Advance past 4s exit
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    // Simulate framer-motion exit complete
    act(() => {
      exitCompleteCallback?.();
    });

    expect(mockShowToast).toHaveBeenCalledWith("Pulse sent!", "success");
  });

  it("should show info toast without refresh after overlay exit on failure", async () => {
    mockSendPulse.mockResolvedValue(false);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // Let promise resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Advance past 4s exit
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    // Simulate framer-motion exit complete
    act(() => {
      exitCompleteCallback?.();
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      "You've already pulsed today",
      "info",
    );
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
