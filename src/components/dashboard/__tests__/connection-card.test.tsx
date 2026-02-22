import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConnectionCard } from "../connection-card";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      active: "Active",
      waiting: "Waiting...",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

describe("ConnectionCard", () => {
  const mockAvatar = "https://example.com/avatar.jpg";
  const mockName = "John Doe";

  describe("Active state", () => {
    it("should render active state correctly", () => {
      const pulseTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      expect(screen.getByText(mockName)).toBeInTheDocument();
      expect(screen.getByText(/Active/)).toBeInTheDocument();
      expect(screen.getByText(/30 minutes ago/)).toBeInTheDocument();
    });

    it("should display avatar with active ring", () => {
      const pulseTime = new Date();

      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      const avatar = screen.getByAltText(mockName);
      expect(avatar).toHaveAttribute("src", mockAvatar);
      expect(avatar).toHaveClass("ring-[var(--teal)]");
    });

    it("should show pulse animation ring", () => {
      const pulseTime = new Date();

      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      // Check for ping animation
      const pingElement = container.querySelector(".animate-ping");
      expect(pingElement).toBeInTheDocument();
    });

    it("should display green status dot", () => {
      const pulseTime = new Date();

      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      // Check for green status dot
      const statusDot = container.querySelector(".bg-\\[var\\(--green\\)\\]");
      expect(statusDot).toBeInTheDocument();
    });

    it("should show heart icon for active state", () => {
      const pulseTime = new Date();

      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      // Check for heart SVG path
      const heartIcon = container.querySelector('path[clip-rule="evenodd"]');
      expect(heartIcon).toBeInTheDocument();
    });

    it("should have full opacity for active card", () => {
      const pulseTime = new Date();

      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      const card = container.querySelector(
        ".border-\\[var\\(--teal\\)\\]\\/30",
      );
      expect(card).toBeInTheDocument();
      expect(card).not.toHaveClass("opacity-70");
    });

    it("should display formatted pulse time", () => {
      const pulseTime = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={pulseTime}
        />,
      );

      expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    });
  });

  describe("Waiting state", () => {
    it("should render waiting state correctly", () => {
      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      expect(screen.getByText(mockName)).toBeInTheDocument();
      expect(screen.getByText("Waiting...")).toBeInTheDocument();
    });

    it("should display avatar with grey ring", () => {
      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      const avatar = screen.getByAltText(mockName);
      expect(avatar).toHaveClass("ring-[var(--slate-300)]");
      expect(avatar).toHaveClass("grayscale-[30%]");
    });

    it("should not show pulse animation for waiting state", () => {
      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      // Should not have ping animation
      const pingElement = container.querySelector(".animate-ping");
      expect(pingElement).not.toBeInTheDocument();
    });

    it("should display grey status dot", () => {
      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      // Check for grey status dot
      const statusDot = container.querySelector(
        ".bg-\\[var\\(--slate-400\\)\\]",
      );
      expect(statusDot).toBeInTheDocument();
    });

    it("should show clock icon for waiting state", () => {
      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      // Check for clock SVG path (stroke instead of fill)
      const clockIcon = container.querySelector('path[stroke-linecap="round"]');
      expect(clockIcon).toBeInTheDocument();
    });

    it("should have reduced opacity for waiting card", () => {
      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      const card = container.firstChild;
      expect(card).toHaveClass("opacity-70");
    });

    it("should not display pulse time when waiting", () => {
      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="waiting"
          pulseTime={null}
        />,
      );

      expect(screen.queryByText(/ago/)).not.toBeInTheDocument();
    });
  });

  describe("Component structure", () => {
    it("should render avatar image", () => {
      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={new Date()}
        />,
      );

      const avatar = screen.getByAltText(mockName);
      expect(avatar).toHaveAttribute("src", mockAvatar);
    });

    it("should have white background and border", () => {
      const { container } = render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={new Date()}
        />,
      );

      const card = container.querySelector(".bg-white");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("border");
    });

    it("should truncate long names", () => {
      render(
        <ConnectionCard
          avatar={mockAvatar}
          name={mockName}
          status="active"
          pulseTime={new Date()}
        />,
      );

      const nameElement = screen.getByText(mockName);
      expect(nameElement).toHaveClass("truncate");
    });
  });
});
