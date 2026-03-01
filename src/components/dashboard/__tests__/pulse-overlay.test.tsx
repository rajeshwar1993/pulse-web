import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      sendingOverlay: "Sending your pulse...",
    };
    return translations[key] || key;
  },
}));

// Mock framer-motion to render synchronously in tests
vi.mock("framer-motion", () => ({
  AnimatePresence: ({
    children,
    onExitComplete,
  }: {
    children: React.ReactNode;
    onExitComplete?: () => void;
  }) => {
    // Store the callback so we can call it when children are removed
    (globalThis as Record<string, unknown>).__onExitComplete = onExitComplete;
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
  it("should render overlay content when isOpen is true", () => {
    render(<PulseOverlay isOpen={true} onComplete={vi.fn()} />);

    expect(screen.getByText("Sending your pulse...")).toBeInTheDocument();
  });

  it("should not render overlay content when isOpen is false", () => {
    render(<PulseOverlay isOpen={false} onComplete={vi.fn()} />);

    expect(
      screen.queryByText("Sending your pulse..."),
    ).not.toBeInTheDocument();
  });

  it("should apply heartbeat animation class to logo wrapper", () => {
    const { container } = render(
      <PulseOverlay isOpen={true} onComplete={vi.fn()} />,
    );

    const heartbeatEl = container.querySelector(".animate-heartbeat");
    expect(heartbeatEl).toBeInTheDocument();
  });

  it("should render PulseLogo inside the overlay", () => {
    const { container } = render(
      <PulseOverlay isOpen={true} onComplete={vi.fn()} />,
    );

    // PulseLogo renders a teal circle with a heart SVG
    const logo = container.querySelector(".rounded-full.bg-teal-300");
    expect(logo).toBeInTheDocument();
  });

  it("should have full-screen fixed positioning with z-50", () => {
    const { container } = render(
      <PulseOverlay isOpen={true} onComplete={vi.fn()} />,
    );

    const overlay = container.querySelector(".fixed.inset-0.z-50");
    expect(overlay).toBeInTheDocument();
  });

  it("should call onComplete when AnimatePresence fires onExitComplete", () => {
    const onComplete = vi.fn();
    const { rerender } = render(
      <PulseOverlay isOpen={true} onComplete={onComplete} />,
    );

    // Close the overlay
    rerender(<PulseOverlay isOpen={false} onComplete={onComplete} />);

    // Simulate framer-motion's onExitComplete callback
    const exitComplete = (globalThis as Record<string, unknown>)
      .__onExitComplete as (() => void) | undefined;
    if (exitComplete) {
      act(() => exitComplete());
    }

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
