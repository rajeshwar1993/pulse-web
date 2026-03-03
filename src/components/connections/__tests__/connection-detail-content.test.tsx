import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ConnectionStats } from "@/lib/types/connection-detail";
import { ConnectionDetailContent } from "../connection-detail-content";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      back: "Back",
      connectedSince: `Connected since ${values?.date ?? ""}`,
      daysConnected: `${values?.count ?? 0} days`,
      sharedStreak: "Shared Streak",
      current: "Current",
      longest: "Longest",
      syncRate: "Pulse Sync",
      syncRateDescription: `Both pulsed on ${values?.synced ?? 0} of ${values?.total ?? 0} days`,
      removeConnection: "Remove Connection",
      removeConfirm: `Remove your connection with ${values?.name ?? ""}? You can restore it within 30 days.`,
      removeError: "Failed to remove connection",
      partnerStreak: `${values?.name ?? ""}'s Streak`,
      cancel: "Cancel",
    };
    return translations[key] || key;
  },
  useLocale: () => "en",
}));

vi.mock("@/hooks/use-partner-time", () => ({
  usePartnerTime: () => "3:45 PM",
}));

vi.mock("@/components/providers/toast-provider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

const mockRemoveConnection = vi.fn();
vi.mock("@/lib/services/connection-service", () => ({
  ConnectionService: {
    removeConnection: (...args: unknown[]) => mockRemoveConnection(...args),
  },
}));

vi.mock("@/lib/utils/streak", () => ({
  getEffectiveStreak: (streak: number) => streak,
}));

const baseStats: ConnectionStats = {
  connectionCreatedAt: "2026-01-15T10:00:00Z",
  totalDaysConnected: 47,
  daysBothPulsed: 35,
  syncRate: 74,
  sharedStreakCurrent: 5,
  sharedStreakLongest: 12,
  otherUserId: "user-456",
  otherDisplayName: "Mom",
  otherAvatarUrl: "https://example.com/mom.png",
  otherTimezone: "America/New_York",
  otherCurrentStreak: 8,
  otherLongestStreak: 20,
  otherLastPulseDate: "2026-03-01",
};

describe("ConnectionDetailContent", () => {
  it("renders partner name", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("Mom")).toBeInTheDocument();
  });

  it("renders partner avatar", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByAltText("Mom")).toBeInTheDocument();
  });

  it("renders partner local time", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("3:45 PM")).toBeInTheDocument();
  });

  it("renders connected since date", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(
      screen.getByText(/Connected since.*January 15, 2026/),
    ).toBeInTheDocument();
  });

  it("renders days connected", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("47 days")).toBeInTheDocument();
  });

  it("renders shared streak values", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("Shared Streak")).toBeInTheDocument();
  });

  it("renders sync rate percentage", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("74%")).toBeInTheDocument();
    expect(
      screen.getByText("Both pulsed on 35 of 47 days"),
    ).toBeInTheDocument();
  });

  it("renders partner streak section", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    expect(screen.getByText("Mom's Streak")).toBeInTheDocument();
  });

  it("opens remove confirmation modal when button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix=""
      />,
    );

    await user.click(screen.getByText("Remove Connection"));

    expect(
      screen.getByText(
        "Remove your connection with Mom? You can restore it within 30 days.",
      ),
    ).toBeInTheDocument();
  });

  it("calls removeConnection on confirm", async () => {
    const user = userEvent.setup();
    mockRemoveConnection.mockResolvedValueOnce(undefined);

    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix="/appview"
      />,
    );

    await user.click(screen.getByText("Remove Connection"));

    // Click the danger button in the modal (second "Remove Connection" text)
    const removeButtons = screen.getAllByText("Remove Connection");
    await user.click(removeButtons[removeButtons.length - 1]);

    expect(mockRemoveConnection).toHaveBeenCalledWith("conn-1");
  });

  it("does not render back button by default", () => {
    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix="/appview"
      />,
    );

    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("navigates back to dashboard on back button click when showBackButton is true", async () => {
    const user = userEvent.setup();

    render(
      <ConnectionDetailContent
        stats={baseStats}
        connectionId="conn-1"
        routePrefix="/appview"
        showBackButton
      />,
    );

    await user.click(screen.getByText("Back"));

    expect(mockPush).toHaveBeenCalledWith("/appview/dashboard");
  });
});
