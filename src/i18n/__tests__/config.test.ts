import { describe, expect, it } from "vitest";
import type { SupportedLocale } from "../config";
import { defaultLocale, localeNames, supportedLocales } from "../config";

describe("i18n/config", () => {
  it('should export "en" as the default locale', () => {
    expect(defaultLocale).toBe("en");
  });

  it('should export supportedLocales as a readonly array containing "en"', () => {
    expect(supportedLocales).toContain("en");
    expect(supportedLocales.length).toBeGreaterThanOrEqual(1);
  });

  it("should export localeNames with display names for all supported locales", () => {
    for (const locale of supportedLocales) {
      expect(localeNames[locale]).toBeDefined();
      expect(typeof localeNames[locale]).toBe("string");
      expect(localeNames[locale].length).toBeGreaterThan(0);
    }
  });

  it('should have "English" as the name for "en"', () => {
    expect(localeNames.en).toBe("English");
  });

  it("should include defaultLocale in supportedLocales", () => {
    expect(supportedLocales).toContain(defaultLocale);
  });

  it("should have SupportedLocale type assignable from supportedLocales entries", () => {
    const locale: SupportedLocale = supportedLocales[0];
    expect(locale).toBe("en");
  });
});
