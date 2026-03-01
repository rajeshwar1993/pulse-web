import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MilestoneBadges } from "../milestone-badges";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Milestones",
      pulseLabel: "Total Pulses",
      streakLabel: "Best Streak",
    };
    return translations[key] || key;
  },
}));

describe("MilestoneBadges", () => {
  it("renders all 11 milestone badges", () => {
    render(<MilestoneBadges totalPulses={50} longestStreak={14} />);

    // 6 pulse milestones
    expect(screen.getByTestId("pulse-milestone-7")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-milestone-30")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-milestone-50")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-milestone-100")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-milestone-200")).toBeInTheDocument();
    expect(screen.getByTestId("pulse-milestone-365")).toBeInTheDocument();

    // 5 streak milestones
    expect(screen.getByTestId("streak-milestone-7")).toBeInTheDocument();
    expect(screen.getByTestId("streak-milestone-14")).toBeInTheDocument();
    expect(screen.getByTestId("streak-milestone-30")).toBeInTheDocument();
    expect(screen.getByTestId("streak-milestone-60")).toBeInTheDocument();
    expect(screen.getByTestId("streak-milestone-100")).toBeInTheDocument();
  });

  it("marks correct pulse milestones as earned (50 pulses)", () => {
    render(<MilestoneBadges totalPulses={50} longestStreak={0} />);

    // Earned: 7, 30, 50
    const earned7 = screen.getByTestId("pulse-milestone-7");
    const earned30 = screen.getByTestId("pulse-milestone-30");
    const earned50 = screen.getByTestId("pulse-milestone-50");
    expect(earned7.querySelector(".opacity-40")).toBeNull();
    expect(earned30.querySelector(".opacity-40")).toBeNull();
    expect(earned50.querySelector(".opacity-40")).toBeNull();

    // Unearned: 100, 200, 365
    const unearned100 = screen.getByTestId("pulse-milestone-100");
    const unearned200 = screen.getByTestId("pulse-milestone-200");
    const unearned365 = screen.getByTestId("pulse-milestone-365");
    expect(unearned100.querySelector(".opacity-40")).not.toBeNull();
    expect(unearned200.querySelector(".opacity-40")).not.toBeNull();
    expect(unearned365.querySelector(".opacity-40")).not.toBeNull();
  });

  it("marks correct streak milestones as earned (14 streak)", () => {
    render(<MilestoneBadges totalPulses={0} longestStreak={14} />);

    // Earned: 7, 14
    const earned7 = screen.getByTestId("streak-milestone-7");
    const earned14 = screen.getByTestId("streak-milestone-14");
    expect(earned7.querySelector(".opacity-40")).toBeNull();
    expect(earned14.querySelector(".opacity-40")).toBeNull();

    // Unearned: 30, 60, 100
    const unearned30 = screen.getByTestId("streak-milestone-30");
    const unearned60 = screen.getByTestId("streak-milestone-60");
    const unearned100 = screen.getByTestId("streak-milestone-100");
    expect(unearned30.querySelector(".opacity-40")).not.toBeNull();
    expect(unearned60.querySelector(".opacity-40")).not.toBeNull();
    expect(unearned100.querySelector(".opacity-40")).not.toBeNull();
  });

  it("shows all badges as earned when values exceed all thresholds", () => {
    render(<MilestoneBadges totalPulses={500} longestStreak={200} />);

    // No opacity-40 elements should exist (all earned)
    const { container } = render(
      <MilestoneBadges totalPulses={500} longestStreak={200} />,
    );
    const unearnedBadges = container.querySelectorAll(".opacity-40");
    expect(unearnedBadges).toHaveLength(0);
  });

  it("shows all badges as unearned when values are 0", () => {
    const { container } = render(
      <MilestoneBadges totalPulses={0} longestStreak={0} />,
    );
    // All 11 badges should be unearned (opacity-40)
    const unearnedBadges = container.querySelectorAll(".opacity-40");
    expect(unearnedBadges).toHaveLength(11);
  });

  it("renders section headings", () => {
    render(<MilestoneBadges totalPulses={0} longestStreak={0} />);
    expect(screen.getByText("Milestones")).toBeInTheDocument();
    expect(screen.getByText("Total Pulses")).toBeInTheDocument();
    expect(screen.getByText("Best Streak")).toBeInTheDocument();
  });

  it("has the correct test id", () => {
    render(<MilestoneBadges totalPulses={0} longestStreak={0} />);
    expect(screen.getByTestId("milestone-badges")).toBeInTheDocument();
  });
});
