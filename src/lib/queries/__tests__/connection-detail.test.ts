import { describe, expect, it, vi } from "vitest";
import { fetchConnectionStats } from "../connection-detail";

vi.mock("@/lib/utils/streak", () => ({
  getEffectiveStreak: (streak: number) => streak,
}));

function mockClient(
  data: Record<string, unknown>[] | null,
  error: unknown = null,
) {
  return {
    rpc: vi.fn().mockResolvedValue({ data, error }),
    // biome-ignore lint/suspicious/noExplicitAny: mock client
  } as any;
}

const sampleRow = {
  connection_created_at: "2026-01-15T10:00:00Z",
  total_days_connected: 47,
  days_both_pulsed: 35,
  sync_rate: 74,
  shared_streak_current: 5,
  shared_streak_longest: 12,
  other_user_id: "user-456",
  other_display_name: "Mom",
  other_avatar_url: "https://example.com/mom.png",
  other_timezone: "America/New_York",
  other_current_streak: 8,
  other_longest_streak: 20,
  other_last_pulse_date: "2026-03-01",
};

describe("fetchConnectionStats", () => {
  it("calls RPC with correct parameters", async () => {
    const client = mockClient([sampleRow]);
    await fetchConnectionStats(client, "conn-1");

    expect(client.rpc).toHaveBeenCalledWith("get_connection_stats", {
      p_connection_id: "conn-1",
    });
  });

  it("maps snake_case to camelCase", async () => {
    const client = mockClient([sampleRow]);
    const result = await fetchConnectionStats(client, "conn-1");

    expect(result).toEqual({
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
    });
  });

  it("returns null on error", async () => {
    const client = mockClient(null, { message: "Not found" });
    const result = await fetchConnectionStats(client, "conn-1");

    expect(result).toBeNull();
  });

  it("returns null when data is empty array", async () => {
    const client = mockClient([]);
    const result = await fetchConnectionStats(client, "conn-1");

    expect(result).toBeNull();
  });

  it("returns null when data is null", async () => {
    const client = mockClient(null);
    const result = await fetchConnectionStats(client, "conn-1");

    expect(result).toBeNull();
  });
});
