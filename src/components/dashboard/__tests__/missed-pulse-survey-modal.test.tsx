import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockSubmit = vi.fn();

vi.mock("@/lib/services/missed-pulse-service", () => ({
  submitMissedPulseSurvey: (...args: unknown[]) => mockSubmit(...args),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "We missed you!",
      subtitle: "What happened yesterday?",
      "responses.forgot": "I forgot",
      "responses.busy": "Too busy",
      "responses.tech_issue": "Tech issue",
      "responses.not_feeling_it": "Not feeling it",
      skip: "Skip",
    };
    return translations[key] || key;
  },
}));

import { MissedPulseSurveyModal } from "../missed-pulse-survey-modal";

describe("MissedPulseSurveyModal", () => {
  const defaultProps = {
    missedDate: "2026-02-21",
    onComplete: vi.fn(),
  };

  it("should render title, subtitle, and all response buttons", () => {
    render(<MissedPulseSurveyModal {...defaultProps} />);

    expect(screen.getByText("We missed you!")).toBeInTheDocument();
    expect(screen.getByText("What happened yesterday?")).toBeInTheDocument();
    expect(screen.getByText("I forgot")).toBeInTheDocument();
    expect(screen.getByText("Too busy")).toBeInTheDocument();
    expect(screen.getByText("Tech issue")).toBeInTheDocument();
    expect(screen.getByText("Not feeling it")).toBeInTheDocument();
    expect(screen.getByText("Skip")).toBeInTheDocument();
  });

  it("should render as an accessible dialog", () => {
    render(<MissedPulseSurveyModal {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      "missed-pulse-survey-title",
    );
  });

  it("should submit response when a button is tapped", async () => {
    mockSubmit.mockResolvedValue(true);
    const onComplete = vi.fn();

    render(
      <MissedPulseSurveyModal {...defaultProps} onComplete={onComplete} />,
    );

    fireEvent.click(screen.getByText("I forgot"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("2026-02-21", "forgot");
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("should submit 'busy' response", async () => {
    mockSubmit.mockResolvedValue(true);
    const onComplete = vi.fn();

    render(
      <MissedPulseSurveyModal {...defaultProps} onComplete={onComplete} />,
    );

    fireEvent.click(screen.getByText("Too busy"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("2026-02-21", "busy");
    });
  });

  it("should submit 'skipped' when Skip is clicked", async () => {
    mockSubmit.mockResolvedValue(true);
    const onComplete = vi.fn();

    render(
      <MissedPulseSurveyModal {...defaultProps} onComplete={onComplete} />,
    );

    fireEvent.click(screen.getByText("Skip"));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("2026-02-21", "skipped");
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("should submit 'skipped' on Escape key", async () => {
    mockSubmit.mockResolvedValue(true);
    const onComplete = vi.fn();

    render(
      <MissedPulseSurveyModal {...defaultProps} onComplete={onComplete} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith("2026-02-21", "skipped");
    });
  });
});
