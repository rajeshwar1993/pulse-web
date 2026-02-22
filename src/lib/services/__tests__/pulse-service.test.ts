import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => mockGetUser(),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

vi.mock("@/lib/constants", () => ({
  PULSE_DAY_RESET_HOUR: 4,
}));

// Import after mocks
import { hasPulsedToday, sendPulse } from "../pulse-service";

function createQueryMock(result: { data?: unknown; error?: unknown }) {
  // biome-ignore lint/suspicious/noExplicitAny: chainable mock
  const chain: any = {};
  for (const method of [
    "select",
    "insert",
    "eq",
    "gte",
    "limit",
    "maybeSingle",
  ]) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  chain.maybeSingle = vi.fn().mockResolvedValue(result);
  // biome-ignore lint/suspicious/noThenProperty: intentional thenable mock for Supabase insert chain
  // biome-ignore lint/suspicious/noExplicitAny: mock callback types
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

const mockUser = { id: "user-123" };

describe("pulse-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("hasPulsedToday", () => {
    it("should return true when pulse exists after 4AM boundary", async () => {
      // Set time to 10 AM — pulse day started at 4 AM today
      vi.setSystemTime(new Date(2026, 1, 22, 10, 0, 0));
      const expected4AM = new Date(2026, 1, 22, 4, 0, 0).toISOString();

      const queryMock = createQueryMock({
        data: { id: "pulse-1" },
        error: null,
      });
      mockFrom.mockReturnValue(queryMock);

      const result = await hasPulsedToday();

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("daily_pulses");
      expect(queryMock.eq).toHaveBeenCalledWith("user_id", "user-123");
      expect(queryMock.gte).toHaveBeenCalledWith("created_at", expected4AM);
    });

    it("should return false when no pulse exists", async () => {
      vi.setSystemTime(new Date(2026, 1, 22, 10, 0, 0));

      const queryMock = createQueryMock({ data: null, error: null });
      mockFrom.mockReturnValue(queryMock);

      const result = await hasPulsedToday();

      expect(result).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await hasPulsedToday();

      expect(result).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should use previous day 4AM when current time is before 4AM", async () => {
      // Set time to 2 AM on Feb 22 — pulse day started at 4 AM on Feb 21
      vi.setSystemTime(new Date(2026, 1, 22, 2, 0, 0));
      const yesterday4AM = new Date(2026, 1, 21, 4, 0, 0).toISOString();

      const queryMock = createQueryMock({ data: null, error: null });
      mockFrom.mockReturnValue(queryMock);

      await hasPulsedToday();

      expect(queryMock.gte).toHaveBeenCalledWith("created_at", yesterday4AM);
    });

    it("should use today 4AM when current time is after 4AM", async () => {
      // Set time to 5 AM on Feb 22 — pulse day started at 4 AM today
      vi.setSystemTime(new Date(2026, 1, 22, 5, 0, 0));
      const today4AM = new Date(2026, 1, 22, 4, 0, 0).toISOString();

      const queryMock = createQueryMock({ data: null, error: null });
      mockFrom.mockReturnValue(queryMock);

      await hasPulsedToday();

      expect(queryMock.gte).toHaveBeenCalledWith("created_at", today4AM);
    });
  });

  describe("sendPulse", () => {
    it("should insert pulse and return true on success", async () => {
      vi.setSystemTime(new Date(2026, 1, 22, 10, 0, 0));

      // hasPulsedToday check — no existing pulse
      const selectMock = createQueryMock({ data: null, error: null });
      // insert call — success
      const insertMock = createQueryMock({ data: null, error: null });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        // First call is from hasPulsedToday (select), second is insert
        return callCount <= 1 ? selectMock : insertMock;
      });

      const result = await sendPulse();

      expect(result).toBe(true);
      expect(insertMock.insert).toHaveBeenCalledWith({ user_id: "user-123" });
    });

    it("should return false when already pulsed today", async () => {
      vi.setSystemTime(new Date(2026, 1, 22, 10, 0, 0));

      // hasPulsedToday returns existing pulse
      const selectMock = createQueryMock({
        data: { id: "pulse-1" },
        error: null,
      });
      mockFrom.mockReturnValue(selectMock);

      const result = await sendPulse();

      expect(result).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await sendPulse();

      expect(result).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should return false on insert error", async () => {
      vi.setSystemTime(new Date(2026, 1, 22, 10, 0, 0));

      // hasPulsedToday — no existing pulse
      const selectMock = createQueryMock({ data: null, error: null });
      // insert — error
      const insertMock = createQueryMock({
        data: null,
        error: { message: "DB error" },
      });

      let callCount = 0;
      mockFrom.mockImplementation(() => {
        callCount++;
        return callCount <= 1 ? selectMock : insertMock;
      });

      const result = await sendPulse();

      expect(result).toBe(false);
    });
  });
});
