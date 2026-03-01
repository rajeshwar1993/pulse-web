import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
    };
    return translations[key] || key;
  },
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

  it("should hide overlay after sendPulse resolves and 3s elapse", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Advance past the 3-second minimum
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    // Overlay should be gone (isOpen=false, mock AnimatePresence removes children)
    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
  });

  it("should show success toast and refresh after overlay exit on success", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

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

  it("should wait for 3s minimum even if sendPulse resolves instantly", async () => {
    mockSendPulse.mockResolvedValue(true);

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // sendPulse resolved instantly, but only 1s has passed
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Overlay should still be visible
    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Advance remaining time
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
  });

  it("should wait for slow sendPulse even after 3s", async () => {
    // sendPulse takes 5 seconds
    mockSendPulse.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 5000)),
    );

    render(<BrowserDashboardClient {...baseProps} />);

    await act(async () => {
      screen.getByTestId("pulse-btn").click();
    });

    // After 3 seconds, overlay should still show (sendPulse hasn't resolved)
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // After 5 seconds total, sendPulse resolves and overlay dismisses
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
  });
});
