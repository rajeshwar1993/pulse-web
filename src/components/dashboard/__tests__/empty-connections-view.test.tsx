import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyConnectionsView } from "@/components/shared/empty-connections-view";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "No connections yet",
      message:
        "Add your first connection to start sharing your daily pulse with family and friends.",
      addButton: "Add Connection",
      comingSoonNote: "Coming soon in Unit 3: Connections",
    };
    return translations[key] || key;
  },
}));

describe("EmptyConnectionsView", () => {
  it("should render empty state message", () => {
    render(<EmptyConnectionsView />);

    expect(screen.getByText("No connections yet")).toBeInTheDocument();
    expect(screen.getByText(/Add your first connection/)).toBeInTheDocument();
  });

  it("should render disabled button when no onAddConnection", () => {
    render(<EmptyConnectionsView />);

    const button = screen.getByRole("button", { name: /add connection/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should show "Coming soon" notice when no onAddConnection', () => {
    render(<EmptyConnectionsView />);

    expect(screen.getByText(/Coming soon in Unit 3/)).toBeInTheDocument();
  });

  it("should render active button when onAddConnection provided", async () => {
    const handleAdd = vi.fn();
    render(<EmptyConnectionsView onAddConnection={handleAdd} />);

    const button = screen.getByRole("button", { name: /add connection/i });
    expect(button).toBeEnabled();

    await userEvent.click(button);
    expect(handleAdd).toHaveBeenCalledOnce();
  });

  it('should not show "Coming soon" when onAddConnection provided', () => {
    render(<EmptyConnectionsView onAddConnection={() => {}} />);

    expect(screen.queryByText(/Coming soon/)).not.toBeInTheDocument();
  });

  it("should render icon/illustration", () => {
    const { container } = render(<EmptyConnectionsView />);

    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass("text-[var(--teal)]");
  });

  it("should have white background and border", () => {
    const { container } = render(<EmptyConnectionsView />);

    const card = container.querySelector(".bg-white");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("border-[var(--slate-200)]");
  });

  it("should have centered content", () => {
    const { container } = render(<EmptyConnectionsView />);

    const centeredContent = container.querySelector(".text-center");
    expect(centeredContent).toBeInTheDocument();
  });

  it("should have plus icon in button", () => {
    const { container } = render(<EmptyConnectionsView />);

    const plusIcon = container.querySelector("button svg path");
    expect(plusIcon).toBeInTheDocument();
  });

  it("should have tooltip on disabled button", () => {
    render(<EmptyConnectionsView />);

    const button = screen.getByRole("button", { name: /add connection/i });
    expect(button).toHaveAttribute(
      "title",
      "Coming soon in Unit 3: Connections",
    );
  });
});
