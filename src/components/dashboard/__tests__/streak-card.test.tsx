import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StreakCard } from "../streak-card";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      days: "{count} days",
      keepGoing: "Keep the streak alive!",
      startStreak: "Pulse daily to start a streak",
      dayLabel: "Day {number}",
    };
    let result = translations[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  },
}));

const baseProps = {
  currentStreak: 3,
  isActive: true,
  totalDays: 15,
  todayPulseDay: "2026-02-26",
  pulsedDates: ["2026-02-24", "2026-02-25", "2026-02-26"],
};

describe("StreakCard", () => {
  it("should always render 12 dots", () => {
    const { container } = render(<StreakCard {...baseProps} />);

    const dots = container.querySelectorAll('[data-testid^="dot-"]');
    expect(dots.length).toBe(12);
  });

  it("should render 11 line segments", () => {
    const { container } = render(<StreakCard {...baseProps} />);

    const segments = container.querySelectorAll('[data-testid^="segment-"]');
    expect(segments.length).toBe(11);
  });

  it("should display the streak count and message", () => {
    render(<StreakCard {...baseProps} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("3 days")).toBeInTheDocument();
    expect(screen.getByText("Keep the streak alive!")).toBeInTheDocument();
  });

  it("should show start streak message when streak is 0", () => {
    render(<StreakCard {...baseProps} currentStreak={0} />);

    expect(
      screen.getByText("Pulse daily to start a streak"),
    ).toBeInTheDocument();
  });

  describe("new user (totalDays < 9)", () => {
    it("should place current day at correct position for day 3", () => {
      const { container } = render(
        <StreakCard
          currentStreak={2}
          isActive={true}
          totalDays={3}
          todayPulseDay="2026-02-26"
          pulsedDates={["2026-02-24", "2026-02-25", "2026-02-26"]}
        />,
      );

      // currentDayIndex = totalDays - 1 = 2 (0-indexed), so dot-2 is current
      const dot2 = container.querySelector('[data-testid="dot-2"]');
      expect(dot2?.getAttribute("data-dot-state")).toBe("current-pulsed");

      // dot-0 and dot-1 should be past pulsed days
      const dot0 = container.querySelector('[data-testid="dot-0"]');
      const dot1 = container.querySelector('[data-testid="dot-1"]');
      expect(dot0?.getAttribute("data-dot-state")).toBe("pulsed");
      expect(dot1?.getAttribute("data-dot-state")).toBe("pulsed");

      // dots 3-11 should be future
      for (let i = 3; i < 12; i++) {
        const dot = container.querySelector(`[data-testid="dot-${i}"]`);
        expect(dot?.getAttribute("data-dot-state")).toBe("future");
      }
    });

    it("should handle day 1 (only current dot, rest future)", () => {
      const { container } = render(
        <StreakCard
          currentStreak={1}
          isActive={true}
          totalDays={1}
          todayPulseDay="2026-02-26"
          pulsedDates={["2026-02-26"]}
        />,
      );

      // currentDayIndex = 0
      const dot0 = container.querySelector('[data-testid="dot-0"]');
      expect(dot0?.getAttribute("data-dot-state")).toBe("current-pulsed");

      // all remaining dots are future
      for (let i = 1; i < 12; i++) {
        const dot = container.querySelector(`[data-testid="dot-${i}"]`);
        expect(dot?.getAttribute("data-dot-state")).toBe("future");
      }
    });
  });

  describe("sliding window (totalDays >= 9)", () => {
    it("should place current day at position 9 (index 8)", () => {
      const { container } = render(<StreakCard {...baseProps} />);

      const dot8 = container.querySelector('[data-testid="dot-8"]');
      expect(dot8?.getAttribute("data-dot-state")).toBe("current-pulsed");

      // dots 9-11 are future
      for (let i = 9; i < 12; i++) {
        const dot = container.querySelector(`[data-testid="dot-${i}"]`);
        expect(dot?.getAttribute("data-dot-state")).toBe("future");
      }
    });

    it("should handle exactly day 9 (transition point)", () => {
      const { container } = render(
        <StreakCard
          currentStreak={1}
          isActive={true}
          totalDays={9}
          todayPulseDay="2026-02-26"
          pulsedDates={["2026-02-26"]}
        />,
      );

      // totalDays >= 9, so currentDayIndex = 8
      const dot8 = container.querySelector('[data-testid="dot-8"]');
      expect(dot8?.getAttribute("data-dot-state")).toBe("current-pulsed");
    });
  });

  describe("dot states", () => {
    it("should mark pulsed days as filled", () => {
      const { container } = render(
        <StreakCard
          {...baseProps}
          pulsedDates={["2026-02-24", "2026-02-25", "2026-02-26"]}
        />,
      );

      // In sliding window mode with todayPulseDay="2026-02-26" and currentDayIndex=8:
      // startDate = 2026-02-18
      // dot at index 6 = 2026-02-24 → pulsed
      // dot at index 7 = 2026-02-25 → pulsed
      const dot6 = container.querySelector('[data-testid="dot-6"]');
      const dot7 = container.querySelector('[data-testid="dot-7"]');
      expect(dot6?.getAttribute("data-dot-state")).toBe("pulsed");
      expect(dot7?.getAttribute("data-dot-state")).toBe("pulsed");
    });

    it("should mark missed days with red border", () => {
      const { container } = render(
        <StreakCard
          {...baseProps}
          pulsedDates={["2026-02-26"]}
        />,
      );

      // startDate = 2026-02-18, dot at index 0 = 2026-02-18 → missed (not in pulsedDates)
      const dot0 = container.querySelector('[data-testid="dot-0"]');
      expect(dot0?.getAttribute("data-dot-state")).toBe("missed");

      // Check it has the red border class
      const missedCircle = dot0?.querySelector(".border-\\[var\\(--error\\)\\]");
      expect(missedCircle).not.toBeNull();
    });

    it("should show current day with pulsing animation", () => {
      const { container } = render(<StreakCard {...baseProps} />);

      const currentDot = container.querySelector('[data-testid="dot-8"]');
      const pulsingBorder = currentDot?.querySelector(".animate-ping");
      expect(pulsingBorder).not.toBeNull();
    });

    it("should show current-empty when not yet pulsed today", () => {
      const { container } = render(
        <StreakCard {...baseProps} isActive={false} />,
      );

      const dot8 = container.querySelector('[data-testid="dot-8"]');
      expect(dot8?.getAttribute("data-dot-state")).toBe("current-empty");
    });

    it("should apply decreasing opacity to future dots", () => {
      const { container } = render(<StreakCard {...baseProps} />);

      // Future dots are at indices 9, 10, 11
      const dot9 = container.querySelector('[data-testid="dot-9"]') as HTMLElement;
      const dot10 = container.querySelector('[data-testid="dot-10"]') as HTMLElement;
      const dot11 = container.querySelector('[data-testid="dot-11"]') as HTMLElement;

      expect(dot9.style.opacity).toBe("0.9");
      expect(dot10.style.opacity).toBe("0.8");
      expect(dot11.style.opacity).toBe("0.7");
    });
  });

  describe("streak grouping (line segments)", () => {
    it("should use teal line between consecutive pulsed dots", () => {
      const { container } = render(
        <StreakCard
          {...baseProps}
          pulsedDates={[
            "2026-02-24",
            "2026-02-25",
            "2026-02-26",
          ]}
        />,
      );

      // In sliding window: startDate = 2026-02-18
      // Index 6 = 2026-02-24 (pulsed), index 7 = 2026-02-25 (pulsed), index 8 = 2026-02-26 (current-pulsed)
      // Segment between 6-7 and 7-8 should be teal
      const seg6 = container.querySelector('[data-testid="segment-6"]');
      const seg7 = container.querySelector('[data-testid="segment-7"]');
      expect(seg6?.classList.contains("bg-[var(--teal)]")).toBe(true);
      expect(seg7?.classList.contains("bg-[var(--teal)]")).toBe(true);
    });

    it("should use grey line when one dot is missed", () => {
      const { container } = render(
        <StreakCard
          {...baseProps}
          pulsedDates={["2026-02-26"]}
        />,
      );

      // Segment between index 0 (missed) and index 1 (missed) → grey
      const seg0 = container.querySelector('[data-testid="segment-0"]');
      expect(seg0?.classList.contains("bg-[var(--slate-200)]")).toBe(true);
    });
  });

  describe("flame icon", () => {
    it("should show flame emoji when streak > 0", () => {
      const { container } = render(<StreakCard {...baseProps} />);

      const flame = container.querySelector('[role="img"]');
      expect(flame).not.toBeNull();
    });

    it("should show grey icon when streak is 0", () => {
      const { container } = render(
        <StreakCard {...baseProps} currentStreak={0} />,
      );

      const greyBg = container.querySelector(".bg-\\[var\\(--slate-200\\)\\]");
      expect(greyBg).not.toBeNull();
    });
  });
});
