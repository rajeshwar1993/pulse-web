import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      sendingOverlay: "Sending your pulse...",
      count: "60",
      "phrases.0": "Test wisdom phrase",
      "phrases.42": "Another wisdom phrase",
    };
    return translations[key] || key;
  },
}));

vi.mock("@/lib/services/wisdom-service", () => ({
  getRandomWisdomIndex: () => 0,
}));

// Mock framer-motion to render synchronously in tests
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

import { PulseOverlay } from "../pulse-overlay";

describe("PulseOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    exitCompleteCallback = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render overlay content when isOpen is true", () => {
    render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();
  });

  it("should not render overlay content when isOpen is false", () => {
    render(
      <PulseOverlay
        isOpen={false}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
  });

  it("should apply heartbeat animation class to logo wrapper", () => {
    const { container } = render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    const heartbeatEl = container.querySelector(".animate-heartbeat");
    expect(heartbeatEl).toBeInTheDocument();
  });

  it("should have full-screen fixed positioning with z-50", () => {
    const { container } = render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    const overlay = container.querySelector(".fixed.inset-0.z-50");
    expect(overlay).toBeInTheDocument();
  });

  it("should show wisdom phrase when pulseResult resolves before 1.5s", async () => {
    const pulseResult = Promise.resolve(true);

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={pulseResult}
      />,
    );

    // Initially shows "Sending your pulse..."
    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Let the resolved promise flush
    await act(async () => {
      await pulseResult;
    });

    // Wisdom should now be visible (replacing the sending text)
    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();
  });

  it("should show wisdom phrase after 1.5s if pulseResult is slow", async () => {
    const pulseResult = new Promise<boolean>((resolve) =>
      setTimeout(() => resolve(true), 10000),
    );

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={pulseResult}
      />,
    );

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();

    // Advance past 1.5s
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    // Wisdom should appear even though pulseResult hasn't resolved
    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();
  });

  it("should exit 3s after wisdom appears", async () => {
    const pulseResult = Promise.resolve(true);

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={pulseResult}
      />,
    );

    // Let promise resolve and show wisdom
    await act(async () => {
      await pulseResult;
    });

    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();

    // Advance 3s — overlay should exit
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();
  });

  it("should call onComplete with success=true when pulse succeeds", async () => {
    const onComplete = vi.fn();
    const pulseResult = Promise.resolve(true);

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={onComplete}
        pulseResult={pulseResult}
      />,
    );

    // Let promise resolve and show wisdom
    await act(async () => {
      await pulseResult;
    });

    // Advance past 3s fade-out
    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    // Simulate framer-motion's onExitComplete
    act(() => {
      exitCompleteCallback?.();
    });

    expect(onComplete).toHaveBeenCalledWith(true);
  });

  it("should call onComplete with success=false when pulse fails", async () => {
    const onComplete = vi.fn();
    const pulseResult = Promise.resolve(false);

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={onComplete}
        pulseResult={pulseResult}
      />,
    );

    await act(async () => {
      await pulseResult;
    });

    await act(async () => {
      vi.advanceTimersByTime(3100);
    });

    act(() => {
      exitCompleteCallback?.();
    });

    expect(onComplete).toHaveBeenCalledWith(false);
  });
});
