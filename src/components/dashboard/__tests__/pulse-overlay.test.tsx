import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
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
    const { container } = render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    expect(container.querySelector(".animate-heartbeat")).toBeInTheDocument();
    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();
  });

  it("should not render overlay content when isOpen is false", () => {
    const { container } = render(
      <PulseOverlay
        isOpen={false}
        onComplete={vi.fn()}
        pulseResult={null}
      />,
    );

    expect(container.querySelector(".animate-heartbeat")).not.toBeInTheDocument();
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

  it("should show wisdom phrase at 1.5s", async () => {
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

    // No text initially
    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();

    // Advance past 1.5s
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    // Wisdom should appear
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

    // No text initially
    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();

    // Advance past 1.5s
    await act(async () => {
      vi.advanceTimersByTime(1600);
    });

    // Wisdom should appear even though pulseResult hasn't resolved
    expect(screen.getByText(/Test wisdom phrase/)).toBeInTheDocument();
  });

  it("should exit at 4s when sendPulse has resolved", async () => {
    const pulseResult = Promise.resolve(true);

    render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={pulseResult}
      />,
    );

    // Let promise resolve
    await act(async () => {
      await pulseResult;
    });

    // Advance past 4s — overlay should exit
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(screen.queryByText(/Test wisdom phrase/)).not.toBeInTheDocument();
  });

  it("should wait for slow sendPulse past 4s", async () => {
    let resolvePromise: (value: boolean) => void;
    const pulseResult = new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });

    const { container } = render(
      <PulseOverlay
        isOpen={true}
        onComplete={vi.fn()}
        pulseResult={pulseResult}
      />,
    );

    // Advance past 4s — overlay should still be visible (sendPulse not resolved)
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    expect(container.querySelector(".animate-heartbeat")).toBeInTheDocument();

    // Now resolve sendPulse — overlay should exit
    await act(async () => {
      resolvePromise!(true);
      await pulseResult;
    });

    expect(container.querySelector(".animate-heartbeat")).not.toBeInTheDocument();
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

    // Let promise resolve
    await act(async () => {
      await pulseResult;
    });

    // Advance past 4s exit
    await act(async () => {
      vi.advanceTimersByTime(4100);
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
      vi.advanceTimersByTime(4100);
    });

    act(() => {
      exitCompleteCallback?.();
    });

    expect(onComplete).toHaveBeenCalledWith(false);
  });
});
