import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StreakBadge } from "../streak-badge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      days: "{count, plural, =0 {days} =1 {day} other {days}}",
      keepGoing: "Keep the streak alive!",
      startStreak: "Pulse daily to start a streak",
      best: "Best",
    };
    let result = translations[key] || key;
    if (params?.count !== undefined) {
      const count = Number(params.count);
      if (key === "days") {
        return count === 1 ? "day" : "days";
      }
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        result = result.replace(`{${k}}`, String(v));
      }
    }
    return result;
  },
}));

describe("StreakBadge", () => {
  describe("Active streak", () => {
    it("should display current streak count", () => {
      render(<StreakBadge currentStreak={7} longestStreak={14} />);

      expect(screen.getByText("7")).toBeInTheDocument();
    });

    it("should show 'days' label for plural streaks", () => {
      render(<StreakBadge currentStreak={5} longestStreak={10} />);

      expect(screen.getByText("days")).toBeInTheDocument();
    });

    it("should show 'day' label for single day streak", () => {
      render(<StreakBadge currentStreak={1} longestStreak={1} />);

      expect(screen.getByText("day")).toBeInTheDocument();
    });

    it("should show motivational message when streak is active", () => {
      render(<StreakBadge currentStreak={3} longestStreak={5} />);

      expect(screen.getByText("Keep the streak alive!")).toBeInTheDocument();
    });

    it("should show flame emoji when streak is active", () => {
      const { container } = render(
        <StreakBadge currentStreak={5} longestStreak={10} />,
      );

      const flameEmoji = container.querySelector('[role="img"]');
      expect(flameEmoji).toBeInTheDocument();
    });

    it("should have gradient background when streak is active", () => {
      const { container } = render(
        <StreakBadge currentStreak={5} longestStreak={10} />,
      );

      const gradientCircle = container.querySelector(".bg-gradient-to-br");
      expect(gradientCircle).toBeInTheDocument();
    });

    it("should show longest streak when it is greater than 0", () => {
      render(<StreakBadge currentStreak={3} longestStreak={12} />);

      expect(screen.getByText("Best")).toBeInTheDocument();
      expect(screen.getByText("12")).toBeInTheDocument();
    });
  });

  describe("No streak", () => {
    it("should display zero streak count", () => {
      render(<StreakBadge currentStreak={0} longestStreak={0} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should show start streak message when no streak", () => {
      render(<StreakBadge currentStreak={0} longestStreak={0} />);

      expect(
        screen.getByText("Pulse daily to start a streak"),
      ).toBeInTheDocument();
    });

    it("should show grey indicator when no streak", () => {
      const { container } = render(
        <StreakBadge currentStreak={0} longestStreak={0} />,
      );

      const greyCircle = container.querySelector(
        ".bg-\\[var\\(--slate-200\\)\\]",
      );
      expect(greyCircle).toBeInTheDocument();
    });

    it("should show fire SVG icon instead of emoji when no streak", () => {
      const { container } = render(
        <StreakBadge currentStreak={0} longestStreak={0} />,
      );

      // No emoji role="img", instead an SVG
      const flameEmoji = container.querySelector('[role="img"]');
      expect(flameEmoji).not.toBeInTheDocument();

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should not show 'Best' section when longest streak is 0", () => {
      render(<StreakBadge currentStreak={0} longestStreak={0} />);

      expect(screen.queryByText("Best")).not.toBeInTheDocument();
    });

    it("should still show 'Best' section when longest streak exists but current is 0", () => {
      render(<StreakBadge currentStreak={0} longestStreak={5} />);

      expect(screen.getByText("Best")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("Component structure", () => {
    it("should render inside a card with white background", () => {
      const { container } = render(
        <StreakBadge currentStreak={3} longestStreak={5} />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("border");
    });

    it("should use flex layout for content", () => {
      const { container } = render(
        <StreakBadge currentStreak={3} longestStreak={5} />,
      );

      const flexContainer = container.querySelector(
        ".flex.items-center.justify-between",
      );
      expect(flexContainer).toBeInTheDocument();
    });
  });
});
