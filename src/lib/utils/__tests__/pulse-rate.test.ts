import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computePulseRate } from "../pulse-rate";

describe("computePulseRate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-22T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes rate when joined before the month", () => {
    // 22 eligible days (Feb 1–22), 15 pulses → 68%
    const rate = computePulseRate(15, "2025-06-15T10:30:00Z", "2026-02-22");
    expect(rate).toBe(68);
  });

  it("computes rate when joined mid-month", () => {
    // Joined Feb 10 → 13 eligible days (Feb 10–22), 10 pulses → 77%
    const rate = computePulseRate(10, "2026-02-10T00:00:00Z", "2026-02-22");
    expect(rate).toBe(77);
  });

  it("returns 100% when joined today with 1 pulse", () => {
    // 1 eligible day, 1 pulse → 100%
    const rate = computePulseRate(1, "2026-02-22T00:00:00Z", "2026-02-22");
    expect(rate).toBe(100);
  });

  it("returns 0% when 0 pulses", () => {
    const rate = computePulseRate(0, "2026-02-01T00:00:00Z", "2026-02-22");
    expect(rate).toBe(0);
  });

  it("clamps to 100% max", () => {
    // 5 eligible days but 10 pulses (shouldn't normally happen, but should clamp)
    const rate = computePulseRate(10, "2026-02-18T00:00:00Z", "2026-02-22");
    expect(rate).toBe(100);
  });

  it("returns 0 when memberSince is in the future", () => {
    const rate = computePulseRate(5, "2026-03-01T00:00:00Z", "2026-02-22");
    expect(rate).toBe(0);
  });
});
