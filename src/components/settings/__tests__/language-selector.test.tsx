import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSelector } from "../language-selector";

describe("LanguageSelector", () => {
  const mockOnLocaleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a button for each supported locale", () => {
    render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("should mark the current locale as checked radio", () => {
    render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    const radio = screen.getByRole("radio", { name: /English/i });
    expect(radio).toHaveAttribute("aria-checked", "true");
  });

  it("should show a checkmark icon for the selected locale", () => {
    const { container } = render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should call onLocaleChange when a locale button is clicked", () => {
    render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    const button = screen.getByRole("radio", { name: /English/i });
    fireEvent.click(button);

    expect(mockOnLocaleChange).toHaveBeenCalledWith("en");
  });

  it('should render all buttons with type="button"', () => {
    render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    const radios = screen.getAllByRole("radio");
    for (const radio of radios) {
      expect(radio).toHaveAttribute("type", "button");
    }
  });

  it("should apply selected styling to the current locale", () => {
    render(
      <LanguageSelector
        currentLocale="en"
        onLocaleChange={mockOnLocaleChange}
      />,
    );

    const selectedButton = screen.getByRole("radio", { name: /English/i });
    expect(selectedButton.className).toContain("border-[var(--teal)]");
  });
});
