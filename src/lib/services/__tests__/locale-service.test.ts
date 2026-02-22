import { beforeEach, describe, expect, it, vi } from "vitest";
import { LOCALE_COOKIE_NAME } from "@/lib/constants";
import { LocaleService } from "../locale-service";

// Mock the supabase client
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Import the mocked module
import { supabase } from "@/lib/supabase/client";

const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;
const mockFrom = supabase.from as ReturnType<typeof vi.fn>;

describe("LocaleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Clear cookies
    // biome-ignore lint/suspicious/noDocumentCookie: test cleanup
    document.cookie = `${LOCALE_COOKIE_NAME}=; max-age=0`;
  });

  describe("getStoredLocale", () => {
    it('should return default locale "en" when no locale is stored', () => {
      expect(LocaleService.getStoredLocale()).toBe("en");
    });

    it("should return stored locale when valid locale exists in localStorage", () => {
      localStorage.setItem(LOCALE_COOKIE_NAME, "en");
      expect(LocaleService.getStoredLocale()).toBe("en");
    });

    it("should return default locale when invalid locale is stored", () => {
      localStorage.setItem(LOCALE_COOKIE_NAME, "xx");
      expect(LocaleService.getStoredLocale()).toBe("en");
    });

    it("should return default locale when localStorage has empty string", () => {
      localStorage.setItem(LOCALE_COOKIE_NAME, "");
      expect(LocaleService.getStoredLocale()).toBe("en");
    });
  });

  describe("setStoredLocale", () => {
    it("should store locale in localStorage", () => {
      LocaleService.setStoredLocale("en");
      expect(localStorage.getItem(LOCALE_COOKIE_NAME)).toBe("en");
    });

    it("should set a cookie with the locale", () => {
      LocaleService.setStoredLocale("en");
      expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en`);
    });
  });

  describe("syncToProfile", () => {
    it("should update profile when user is authenticated", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      });
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      mockFrom.mockReturnValue({ update: mockUpdate });

      await LocaleService.syncToProfile("en");

      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(mockUpdate).toHaveBeenCalledWith({ language_preference: "en" });
    });

    it("should not update profile when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      await LocaleService.syncToProfile("en");

      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should not throw when sync fails", async () => {
      mockGetUser.mockRejectedValue(new Error("Network error"));

      await expect(LocaleService.syncToProfile("en")).resolves.not.toThrow();
    });
  });

  describe("getProfileLocale", () => {
    it("should return locale from profile when user is authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      const mockSingle = vi.fn().mockResolvedValue({
        data: { language_preference: "en" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await LocaleService.getProfileLocale();

      expect(result).toBe("en");
    });

    it("should return null when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const result = await LocaleService.getProfileLocale();

      expect(result).toBeNull();
    });

    it("should return null when profile has no language_preference", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      const mockSingle = vi.fn().mockResolvedValue({
        data: { language_preference: null },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await LocaleService.getProfileLocale();

      expect(result).toBeNull();
    });

    it("should return null when profile has unsupported locale", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
      });
      const mockSingle = vi.fn().mockResolvedValue({
        data: { language_preference: "xx" },
      });
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await LocaleService.getProfileLocale();

      expect(result).toBeNull();
    });

    it("should return null and not throw when fetch fails", async () => {
      mockGetUser.mockRejectedValue(new Error("Network error"));

      const result = await LocaleService.getProfileLocale();

      expect(result).toBeNull();
    });
  });

  describe("notifyFlutterBridge", () => {
    it("should send message to FlutterBridge when available", () => {
      const mockPostMessage = vi.fn();
      // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
      (window as any).FlutterBridge = { postMessage: mockPostMessage };

      LocaleService.notifyFlutterBridge("en");

      expect(mockPostMessage).toHaveBeenCalledWith(
        JSON.stringify({ type: "LOCALE_CHANGED", payload: { locale: "en" } }),
      );

      // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
      delete (window as any).FlutterBridge;
    });

    it("should not throw when FlutterBridge is not available", () => {
      // biome-ignore lint/suspicious/noExplicitAny: FlutterBridge not typed on Window
      delete (window as any).FlutterBridge;

      expect(() => LocaleService.notifyFlutterBridge("en")).not.toThrow();
    });
  });
});
