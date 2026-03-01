import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarLegend } from "../calendar-legend";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      pulsed: "Pulsed",
      missed: "Missed",
      today: "Today",
      streak: "Streak",
    };
    return translations[key] || key;
  },
}));

describe("CalendarLegend", () => {
  it("renders 4 legend items", () => {
    render(<CalendarLegend />);
    expect(screen.getByText("Pulsed")).toBeInTheDocument();
    expect(screen.getByText("Missed")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Streak")).toBeInTheDocument();
  });

  it("has the correct test id", () => {
    render(<CalendarLegend />);
    expect(screen.getByTestId("calendar-legend")).toBeInTheDocument();
  });

  it("renders correct dot styling classes", () => {
    const { container } = render(<CalendarLegend />);
    const dots = container.querySelectorAll(".rounded-full");

    expect(dots[0]).toHaveClass("bg-teal-300");
    expect(dots[1]).toHaveClass("border-rose-300", "bg-rose-50");
    expect(dots[2]).toHaveClass("border-[var(--slate-400)]");
    expect(dots[3]).toHaveClass("bg-teal-50", "border-teal-200");
  });
});
