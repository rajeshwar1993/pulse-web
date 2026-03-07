import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WisdomCard } from "../wisdom-card";

// Mock the wisdom service
vi.mock("@/lib/services/wisdom-service", () => ({
  getRandomWisdomIndex: () => 2,
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      common: { tapToDismiss: "Tap to dismiss" },
      "dashboard.wisdomCard": { ariaLabel: "Wisdom card - click to dismiss" },
    };
    return (key: string) => translations[namespace]?.[key] || key;
  },
}));

const testPhrases = [
  "A simple pulse is the highlight of a parent's morning.",
  "Small gestures, big impact.",
  "You just made someone's day a little brighter.",
];

describe("WisdomCard", () => {
  it("should render wisdom text", () => {
    render(<WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />);

    expect(
      screen.getByText('"You just made someone\'s day a little brighter."'),
    ).toBeInTheDocument();
  });

  it("should show dismiss hint text", () => {
    render(<WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />);

    expect(screen.getByText("Tap to dismiss")).toBeInTheDocument();
  });

  it("should render as a button element", () => {
    render(<WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />);

    const card = screen.getByRole("button", { name: /wisdom card/i });
    expect(card).toBeInTheDocument();
    expect(card.tagName).toBe("BUTTON");
  });

  it("should have gradient accent bar", () => {
    const { container } = render(
      <WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />,
    );

    const accentBar = container.querySelector(".bg-gradient-to-r");
    expect(accentBar).toBeInTheDocument();
  });

  it("should have glassmorph styling", () => {
    const { container } = render(
      <WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />,
    );

    const card = container.querySelector(".backdrop-blur-md");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-white/80");
  });

  it("should call handleDismiss on click", () => {
    const onDismiss = vi.fn();
    render(
      <WisdomCard
        wisdomPhrases={testPhrases}
        autoDismiss={false}
        onDismiss={onDismiss}
      />,
    );

    const card = screen.getByRole("button", { name: /wisdom card/i });
    fireEvent.click(card);

    // Check that the card starts the dismiss animation (opacity changes)
    expect(card).toHaveClass("opacity-0");
  });

  it("should call handleDismiss on Enter key press", () => {
    const onDismiss = vi.fn();
    render(
      <WisdomCard
        wisdomPhrases={testPhrases}
        autoDismiss={false}
        onDismiss={onDismiss}
      />,
    );

    const card = screen.getByRole("button", { name: /wisdom card/i });
    fireEvent.keyDown(card, { key: "Enter" });

    // Check that the card starts the dismiss animation
    expect(card).toHaveClass("opacity-0");
  });

  it("should call handleDismiss on Space key press", () => {
    const onDismiss = vi.fn();
    render(
      <WisdomCard
        wisdomPhrases={testPhrases}
        autoDismiss={false}
        onDismiss={onDismiss}
      />,
    );

    const card = screen.getByRole("button", { name: /wisdom card/i });
    fireEvent.keyDown(card, { key: " " });

    // Check that the card starts the dismiss animation
    expect(card).toHaveClass("opacity-0");
  });

  it("should accept autoDismiss prop", () => {
    const { rerender } = render(
      <WisdomCard wisdomPhrases={testPhrases} autoDismiss={false} />,
    );
    expect(
      screen.getByText('"You just made someone\'s day a little brighter."'),
    ).toBeInTheDocument();

    rerender(<WisdomCard wisdomPhrases={testPhrases} autoDismiss={true} />);
    expect(
      screen.getByText('"You just made someone\'s day a little brighter."'),
    ).toBeInTheDocument();
  });

  it("should accept dismissDelay prop", () => {
    render(
      <WisdomCard
        wisdomPhrases={testPhrases}
        autoDismiss={true}
        dismissDelay={5000}
      />,
    );
    expect(
      screen.getByText('"You just made someone\'s day a little brighter."'),
    ).toBeInTheDocument();
  });

  it("should render nothing when wisdomPhrases is empty", () => {
    const { container } = render(
      <WisdomCard wisdomPhrases={[]} autoDismiss={false} />,
    );

    expect(container.innerHTML).toBe("");
  });
});
