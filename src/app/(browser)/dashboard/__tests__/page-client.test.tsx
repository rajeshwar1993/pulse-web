import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserDashboardClient } from "../page-client";

// --- Mocks ---

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
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
      sendingOverlay: "Sending your pulse...",
      count: "60",
      "phrases.0": "Test wisdom phrase",
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

    render(<BrowserDashboardClient {...baseProps} />);

    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();
  });

  it("should show wisdom after pulseResult resolves then exit after 3s", async () => {
    let resolvePromise: (value: boolean) => void;
    const promise = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
    mockSendPulse.mockReturnValue(promise);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Resolve the pulse
    await act(async () => {
      resolvePromise!(true);
      await promise;
    });

    // Wisdom should be shown
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();

    // Advance 3s — overlay should exit
    await act(async () => {
      vi.advanceTimersByTime(3100);
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

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Advance past 1.5s
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    // Wisdom should appear
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();
  });

  it("should show success toast and refresh after overlay exit on success", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // Let promise resolve
    await act(async () => {
      await Promise.resolve();
    });

    // Advance past 3s fade-out
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    // Simulate framer-motion exit complete
    act(() => {
      exitCompleteCallback?.();
    });

    expect(mockShowToast).toHaveBeenCalledWith("Pulse sent!", "success");
    expect(mockRefresh).toHaveBeenCalledOnce();
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

    // Advance past 3s fade-out
    await act(async () => {
      vi.advanceTimersByTime(3100);
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
