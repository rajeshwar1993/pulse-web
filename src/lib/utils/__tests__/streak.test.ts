import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getEffectiveStreak } from "../streak";

describe("getEffectiveStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 0 when lastPulseDate is null", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0)); // 10 AM
    expect(getEffectiveStreak(5, null)).toBe(0);
  });

  it("should return 0 when currentStreak is 0", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(0, "2026-02-22")).toBe(0);
  });

  it("should return current streak when last pulse was today (after 4 AM)", () => {
    // Current time: Feb 22 at 10 AM → pulse day = Feb 22
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(7, "2026-02-22")).toBe(7);
  });

  it("should return current streak when last pulse was yesterday", () => {
    // Current time: Feb 22 at 10 AM → pulse day = Feb 22
    // Last pulse date: Feb 21 → difference = 1 day (still alive)
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(5, "2026-02-21")).toBe(5);
  });

  it("should return 0 when last pulse was 2 days ago", () => {
    // Current time: Feb 22 at 10 AM → pulse day = Feb 22
    // Last pulse date: Feb 20 → difference = 2 days (broken)
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(5, "2026-02-20")).toBe(0);
  });

  it("should return 0 when last pulse was many days ago", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(30, "2026-01-15")).toBe(0);
  });

  it("should account for 4 AM boundary (before 4 AM belongs to previous day)", () => {
    // Current time: Feb 22 at 3 AM → adjusted pulse day = Feb 21
    // Last pulse date: Feb 21 → difference = 0 (same day, alive)
    vi.setSystemTime(new Date(2026, 1, 22, 3, 0));
    expect(getEffectiveStreak(10, "2026-02-21")).toBe(10);
  });

  it("should handle 4 AM boundary - yesterday's pulse still valid before 4 AM", () => {
    // Current time: Feb 22 at 3 AM → adjusted pulse day = Feb 21
    // Last pulse date: Feb 20 → difference = 1 (yesterday in pulse-day terms, alive)
    vi.setSystemTime(new Date(2026, 1, 22, 3, 0));
    expect(getEffectiveStreak(3, "2026-02-20")).toBe(3);
  });

  it("should handle 4 AM boundary - 2 days ago pulse broken before 4 AM", () => {
    // Current time: Feb 22 at 3 AM → adjusted pulse day = Feb 21
    // Last pulse date: Feb 19 → difference = 2 (broken)
    vi.setSystemTime(new Date(2026, 1, 22, 3, 0));
    expect(getEffectiveStreak(3, "2026-02-19")).toBe(0);
  });

  it("should return streak of 1 when it is 1", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(1, "2026-02-22")).toBe(1);
  });

  it("should handle large streaks correctly", () => {
    vi.setSystemTime(new Date(2026, 1, 22, 10, 0));
    expect(getEffectiveStreak(365, "2026-02-22")).toBe(365);
  });
});
