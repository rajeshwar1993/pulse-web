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

  it("should render 30 calendar dots total", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const filled = screen.queryAllByTestId("dot-filled");
    const ghost = screen.queryAllByTestId("dot-ghost");
    expect(filled.length + ghost.length).toBe(30);
  });

  it("should render filled dots for pulsed dates", () => {
    const today = formatDate(new Date());
    const yesterday = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

    render(<GhostCalendar pulsedDates={[today, yesterday]} />);

    const filled = screen.getAllByTestId("dot-filled");
    expect(filled).toHaveLength(2);
  });

  it("should render all ghost dots when no dates pulsed", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const ghost = screen.getAllByTestId("dot-ghost");
    expect(ghost).toHaveLength(30);
    expect(screen.queryAllByTestId("dot-filled")).toHaveLength(0);
  });

  it("should render inside a Card", () => {
    render(<GhostCalendar pulsedDates={[]} />);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("should render all filled dots when every day is pulsed", () => {
    const allDates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      allDates.push(formatDate(date));
    }

    render(<GhostCalendar pulsedDates={allDates} />);

    expect(screen.getAllByTestId("dot-filled")).toHaveLength(30);
    expect(screen.queryAllByTestId("dot-ghost")).toHaveLength(0);
  });

  it("should distinguish today's ghost dot with stronger border", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const ghosts = screen.getAllByTestId("dot-ghost");
    const todayDot = ghosts[ghosts.length - 1]; // last dot = today
    expect(todayDot.className).toContain("slate-300");
  });

  it("should use lighter border for past ghost dots", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const ghosts = screen.getAllByTestId("dot-ghost");
    const pastDot = ghosts[0]; // first dot = oldest day
    expect(pastDot.className).toContain("slate-200");
  });

  it("should ignore dates outside the 30-day window", () => {
    const oldDate = formatDate(new Date(2025, 0, 1)); // way in the past
    render(<GhostCalendar pulsedDates={[oldDate]} />);

    expect(screen.queryAllByTestId("dot-filled")).toHaveLength(0);
    expect(screen.getAllByTestId("dot-ghost")).toHaveLength(30);
  });

  it("should render a 7-column grid", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    const grid = screen.getByTestId("card").querySelector(".grid");
    expect(grid).toBeDefined();
    expect(grid?.getAttribute("style")).toContain("repeat(7, 1fr)");
  });

  it("should add padding cells to fill the first row", () => {
    render(<GhostCalendar pulsedDates={[]} />);

    // 30 days in 7 columns → 30 % 7 = 2, padding = 5
    // Total grid children = 5 padding + 30 dots = 35
    const grid = screen.getByTestId("card").querySelector(".grid");
    expect(grid?.children.length).toBe(35);
  });
});
