import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ConnectionWithProfile } from "@/lib/types/connection";
import { ConnectionCard } from "../connection-card";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      activeToday: "Active today",
      waiting: "Waiting...",
      removeConnection: "Remove Connection",
    };
    return translations[key] || key;
  },
}));

const baseConnection: ConnectionWithProfile = {
  id: "conn-1",
  user_id: "user-002",
  display_name: "Mom",
  avatar_url: "https://example.com/mom.png",
  timezone: "America/New_York",
  status: "active",
  last_pulse: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  created_at: "2025-01-01T00:00:00Z",
  current_streak: 7,
  longest_streak: 14,
};

describe("ConnectionCard (Connections page)", () => {
  describe("Basic rendering", () => {
    it("should render display name", () => {
      render(<ConnectionCard connection={baseConnection} onRemove={vi.fn()} />);

      expect(screen.getByText("Mom")).toBeInTheDocument();
    });

    it("should render active status label", () => {
      render(<ConnectionCard connection={baseConnection} onRemove={vi.fn()} />);

      expect(screen.getByText("Active today")).toBeInTheDocument();
    });

    it("should render waiting status label", () => {
      const waitingConnection: ConnectionWithProfile = {
        ...baseConnection,
        status: "waiting",
        current_streak: 0,
      };

      render(
        <ConnectionCard connection={waitingConnection} onRemove={vi.fn()} />,
      );

      expect(screen.getByText("Waiting...")).toBeInTheDocument();
    });

    it("should render avatar with correct alt text", () => {
      render(<ConnectionCard connection={baseConnection} onRemove={vi.fn()} />);

      const avatar = screen.getByAltText("Mom");
      expect(avatar).toBeInTheDocument();
    });

    it("should render remove button", () => {
      render(<ConnectionCard connection={baseConnection} onRemove={vi.fn()} />);

      expect(screen.getByText("Remove Connection")).toBeInTheDocument();
    });
  });

  describe("Streak display", () => {
    it("should show streak indicator when current_streak > 0", () => {
      render(<ConnectionCard connection={baseConnection} onRemove={vi.fn()} />);

      // The streak badge shows the number
      expect(screen.getByText(/7/)).toBeInTheDocument();
    });

    it("should not show streak indicator when current_streak is 0", () => {
      const noStreakConnection: ConnectionWithProfile = {
        ...baseConnection,
        current_streak: 0,
      };

      const { container } = render(
        <ConnectionCard connection={noStreakConnection} onRemove={vi.fn()} />,
      );

      // No orange text for streak
      const streakSpan = container.querySelector(".text-orange-500");
      expect(streakSpan).not.toBeInTheDocument();
    });

    it("should show streak next to status label", () => {
      const { container } = render(
        <ConnectionCard connection={baseConnection} onRemove={vi.fn()} />,
      );

      // Streak and status should be in the same flex container
      const streakContainer = container.querySelector(
        ".flex.items-center.gap-2",
      );
      expect(streakContainer).toBeInTheDocument();
    });
  });

  describe("Remove action", () => {
    it("should call onRemove with connection id when button is clicked", async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(
        <ConnectionCard connection={baseConnection} onRemove={onRemove} />,
      );

      await user.click(screen.getByText("Remove Connection"));

      expect(onRemove).toHaveBeenCalledWith("conn-1");
    });
  });
});
