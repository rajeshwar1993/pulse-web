import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GhostCalendar } from "../ghost-calendar";

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
  }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      "weekdays.sun": "S",
      "weekdays.mon": "M",
      "weekdays.tue": "T",
      "weekdays.wed": "W",
      "weekdays.thu": "T",
      "weekdays.fri": "F",
      "weekdays.sat": "S",
    };
    return map[key] ?? key;
  },
}));

// Feb 22, 2026, noon — February has 28 days, Feb 1 is a Sunday
const FAKE_NOW = new Date(2026, 1, 22, 12, 0);
const TODAY_PULSE_DAY = "2026-02-22";
const MEMBER_SINCE = "2026-01-01T00:00:00Z";

function makeDateStr(day: number): string {
  return `2026-02-${String(day).padStart(2, "0")}`;
}

describe("GhostCalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render 28 day cells for February 2026", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const allDots = [
      ...screen.queryAllByTestId("dot-filled"),
      ...screen.queryAllByTestId("dot-missed"),
      ...screen.queryAllByTestId("dot-today"),
      ...screen.queryAllByTestId("dot-future"),
      ...screen.queryAllByTestId("dot-pre-join"),
    ];
    expect(allDots).toHaveLength(28);
  });

  it("should have 0 padding cells since Feb 1 2026 is Sunday", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const paddingCells = screen.queryAllByTestId("padding-cell");
    expect(paddingCells).toHaveLength(0);
  });

  it("should render weekday headers S/M/T/W/T/F/S", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const headers = screen.getAllByTestId("weekday-header");
    expect(headers).toHaveLength(7);
    expect(headers.map((h) => h.textContent)).toEqual([
      "S", "M", "T", "W", "T", "F", "S",
    ]);
  });

  it("should display month title 'February'", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const title = screen.getByTestId("month-title");
    expect(title.textContent).toBe("February");
  });

  it("should render pulsed dates as dot-filled", () => {
    const pulsed = [makeDateStr(1), makeDateStr(5), makeDateStr(10)];

    render(
      <GhostCalendar
        pulsedDates={pulsed}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    expect(screen.getAllByTestId("dot-filled")).toHaveLength(3);
  });

  it("should render unpulsed past days (after join) as dot-missed", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    // Days 1-21 are past (not pulsed, after join) → missed
    const missed = screen.getAllByTestId("dot-missed");
    expect(missed).toHaveLength(21);
  });

  it("should render today (unpulsed) as dot-today, not dot-missed", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const todayDots = screen.getAllByTestId("dot-today");
    expect(todayDots).toHaveLength(1);
    // Should NOT be classified as missed
    expect(screen.queryAllByTestId("dot-missed")).toHaveLength(21); // only days 1-21
  });

  it("should render days before memberSince as dot-pre-join", () => {
    // Member joined Feb 10
    const joinedFeb10 = "2026-02-10T00:00:00Z";

    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={joinedFeb10}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    // Days 1-9 are pre-join
    const preJoin = screen.getAllByTestId("dot-pre-join");
    expect(preJoin).toHaveLength(9);
  });

  it("should render future days as dot-future", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    // Days 23-28 are future
    const future = screen.getAllByTestId("dot-future");
    expect(future).toHaveLength(6);
  });

  it("should show streak background for 8+ consecutive pulsed days", () => {
    // Pulse days 1-8 (8 consecutive)
    const pulsed = Array.from({ length: 8 }, (_, i) => makeDateStr(i + 1));

    render(
      <GhostCalendar
        pulsedDates={pulsed}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const streakBgs = screen.getAllByTestId("streak-bg");
    expect(streakBgs).toHaveLength(8);
  });

  it("should not show streak background for fewer than 7 consecutive pulsed days", () => {
    // Pulse days 1-6 (only 6 consecutive)
    const pulsed = Array.from({ length: 6 }, (_, i) => makeDateStr(i + 1));

    render(
      <GhostCalendar
        pulsedDates={pulsed}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    expect(screen.queryAllByTestId("streak-bg")).toHaveLength(0);
  });

  it("should render a 7-column grid", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    const grid = screen.getByTestId("card").querySelector(".grid");
    expect(grid).toBeDefined();
    expect(grid?.getAttribute("style")).toContain("repeat(7, 1fr)");
  });

  it("should render inside a Card", () => {
    render(
      <GhostCalendar
        pulsedDates={[]}
        memberSince={MEMBER_SINCE}
        todayPulseDay={TODAY_PULSE_DAY}
      />,
    );

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });
});
