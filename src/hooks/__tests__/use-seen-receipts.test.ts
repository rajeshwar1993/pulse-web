import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DashboardConnection } from "@/lib/types/connection";

const mockRecordSeenReceipts = vi.fn();

vi.mock("@/lib/services/seen-receipt-service", () => ({
  recordSeenReceipts: (...args: unknown[]) => mockRecordSeenReceipts(...args),
}));

vi.mock("@/lib/utils/streak", () => ({
  getTodayPulseDay: () => "2026-02-22",
}));

import { useSeenReceipts } from "../use-seen-receipts";

function makeConnection(
  overrides: Partial<DashboardConnection> = {},
): DashboardConnection {
  return {
    id: "conn-1",
    userId: "user-002",
    avatar: "/a.png",
    name: "Mom",
    timezone: "America/New_York",
    status: "active",
    pulseTime: new Date(),
    currentStreak: 5,
    longestStreak: 10,
    ...overrides,
  };
}

describe("useSeenReceipts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call recordSeenReceipts with active user IDs", () => {
    const connections = [
      makeConnection({ userId: "user-002", status: "active" }),
      makeConnection({
        id: "conn-2",
        userId: "user-003",
        status: "active",
      }),
    ];

    renderHook(() => useSeenReceipts(connections));

    expect(mockRecordSeenReceipts).toHaveBeenCalledOnce();
    expect(mockRecordSeenReceipts).toHaveBeenCalledWith(
      ["user-002", "user-003"],
      "2026-02-22",
    );
  });

  it("should skip connections with waiting status", () => {
    const connections = [
      makeConnection({ userId: "user-002", status: "active" }),
      makeConnection({
        id: "conn-2",
        userId: "user-003",
        status: "waiting",
      }),
    ];

    renderHook(() => useSeenReceipts(connections));

    expect(mockRecordSeenReceipts).toHaveBeenCalledWith(
      ["user-002"],
      "2026-02-22",
    );
  });

  it("should not call service when no active connections", () => {
    const connections = [
      makeConnection({ userId: "user-002", status: "waiting" }),
    ];

    renderHook(() => useSeenReceipts(connections));

    expect(mockRecordSeenReceipts).not.toHaveBeenCalled();
  });

  it("should not call service for empty connections", () => {
    renderHook(() => useSeenReceipts([]));

    expect(mockRecordSeenReceipts).not.toHaveBeenCalled();
  });

  it("should fire only once even on re-render (ref guard)", () => {
    const connections = [
      makeConnection({ userId: "user-002", status: "active" }),
    ];

    const { rerender } = renderHook(() => useSeenReceipts(connections));
    rerender();
    rerender();

    expect(mockRecordSeenReceipts).toHaveBeenCalledOnce();
  });
});
