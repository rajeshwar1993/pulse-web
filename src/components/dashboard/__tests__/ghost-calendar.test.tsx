import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GhostCalendar } from "../ghost-calendar";

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("GhostCalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 22, 12, 0)); // Feb 22, 2026, noon
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render 30 calendar dots", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    // 30 days + padding cells in the grid
    // Each dot has a rounded-full class
    const dots = screen.getByTestId("card").querySelectorAll(".rounded-full");
    expect(dots).toHaveLength(30);
  });

  it("should render filled dots for pulsed dates", () => {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    render(<GhostCalendar pulsedDates={[today, yesterday]} />);

    const filledDots = screen
      .getByTestId("card")
      .querySelectorAll(".bg-teal-300");
    expect(filledDots).toHaveLength(2);
  });

  it("should render ghost dots for non-pulsed dates", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    // All 30 dots should be ghost dots (have border classes)
    const ghostDots = screen
      .getByTestId("card")
      .querySelectorAll('[class*="border-2"]');
    expect(ghostDots).toHaveLength(30);
  });

  it("should render inside a Card", () => {
    render(<GhostCalendar pulsedDates={[]} />);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("should handle empty pulsedDates array", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const filledDots = screen
      .getByTestId("card")
      .querySelectorAll(".bg-teal-300");
    expect(filledDots).toHaveLength(0);
  });

  it("should handle all days pulsed", () => {
    const allDates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      allDates.push(formatDate(date));
    }

    render(<GhostCalendar pulsedDates={allDates} />);

    const filledDots = screen
      .getByTestId("card")
      .querySelectorAll(".bg-teal-300");
    expect(filledDots).toHaveLength(30);
  });
});
