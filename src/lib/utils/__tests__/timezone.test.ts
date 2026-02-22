import { describe, expect, it } from "vitest";
import {
  formatTimeInTimezone,
  getHourInTimezone,
  getWaitingContext,
} from "../timezone";

describe("timezone utilities", () => {
  describe("formatTimeInTimezone", () => {
    it("should return a formatted time string for a valid timezone", () => {
      const result = formatTimeInTimezone("America/New_York", "en-US");
      // Should match a time pattern like "10:00 AM" or "2:30 PM"
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it("should return a formatted time string for UTC", () => {
      const result = formatTimeInTimezone("UTC", "en-US");
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i);
    });

    it("should return empty string for invalid timezone", () => {
      const result = formatTimeInTimezone("Invalid/Timezone", "en-US");
      expect(result).toBe("");
    });

    it("should return empty string for empty timezone string", () => {
      const result = formatTimeInTimezone("", "en-US");
      expect(result).toBe("");
    });

    it("should format time with different locale", () => {
      const result = formatTimeInTimezone("Europe/London", "en-GB");
      // en-GB uses 24-hour format typically, but Intl may vary
      expect(result).toBeTruthy();
    });
  });

  describe("getHourInTimezone", () => {
    it("should return a number between 0 and 23 for valid timezone", () => {
      const hour = getHourInTimezone("America/New_York");
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThanOrEqual(23);
    });

    it("should return a valid hour for UTC", () => {
      const hour = getHourInTimezone("UTC");
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThanOrEqual(23);
    });

    it("should return -1 for invalid timezone", () => {
      const hour = getHourInTimezone("Invalid/Timezone");
      expect(hour).toBe(-1);
    });

    it("should return -1 for empty timezone string", () => {
      const hour = getHourInTimezone("");
      expect(hour).toBe(-1);
    });
  });

  describe("getWaitingContext", () => {
    it("should return 'daytime' for invalid timezone (safe default)", () => {
      expect(getWaitingContext("Invalid/Timezone")).toBe("daytime");
    });

    it("should return a valid context for UTC", () => {
      const context = getWaitingContext("UTC");
      expect(["morning", "daytime", "late"]).toContain(context);
    });

    it("should return a valid context for any valid timezone", () => {
      const timezones = [
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo",
        "Australia/Sydney",
        "Pacific/Auckland",
      ];

      for (const tz of timezones) {
        const context = getWaitingContext(tz);
        expect(["morning", "daytime", "late"]).toContain(context);
      }
    });
  });
});
