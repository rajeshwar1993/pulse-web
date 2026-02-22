import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "../format-date";

describe("formatRelativeTime", () => {
  it("should format date with English locale", () => {
    const date = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    const result = formatRelativeTime(date, "en");
    expect(result).toContain("ago");
  });

  it("should default to English for unknown locale", () => {
    const date = new Date(Date.now() - 60 * 1000); // 1 min ago
    const result = formatRelativeTime(date, "xx");
    expect(result).toContain("ago");
  });

  it("should default to English when no locale specified", () => {
    const date = new Date(Date.now() - 60 * 1000);
    const result = formatRelativeTime(date);
    expect(result).toContain("ago");
  });
});
