import { beforeEach, describe, expect, it, vi } from "vitest";

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

import { submitMissedPulseSurvey } from "../missed-pulse-service";

function createUpsertMock(result: { data?: unknown; error?: unknown }) {
  // biome-ignore lint/suspicious/noExplicitAny: chainable mock
  const chain: any = {};
  for (const method of ["upsert"]) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }
  // biome-ignore lint/suspicious/noThenProperty: intentional thenable mock for Supabase upsert chain
  // biome-ignore lint/suspicious/noExplicitAny: mock callback types
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(result).then(resolve, reject);
  return chain;
}

const mockUser = { id: "user-123" };

describe("missed-pulse-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  describe("submitMissedPulseSurvey", () => {
    it("should upsert survey and return true on success", async () => {
      const upsertMock = createUpsertMock({ data: null, error: null });
      mockFrom.mockReturnValue(upsertMock);

      const result = await submitMissedPulseSurvey("2026-02-21", "forgot");

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("missed_pulses");
      expect(upsertMock.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          missed_date: "2026-02-21",
          response: "forgot",
        },
        { onConflict: "user_id,missed_date" },
      );
    });

    it("should return false when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await submitMissedPulseSurvey("2026-02-21", "busy");

      expect(result).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should return false on database error", async () => {
      const upsertMock = createUpsertMock({
        data: null,
        error: { message: "DB error" },
      });
      mockFrom.mockReturnValue(upsertMock);

      const result = await submitMissedPulseSurvey("2026-02-21", "tech_issue");

      expect(result).toBe(false);
    });

    it("should accept all valid response types", async () => {
      const responses = [
        "forgot",
        "busy",
        "tech_issue",
        "not_feeling_it",
        "skipped",
      ] as const;

      for (const response of responses) {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({ data: { user: mockUser } });
        const upsertMock = createUpsertMock({ data: null, error: null });
        mockFrom.mockReturnValue(upsertMock);

        const result = await submitMissedPulseSurvey("2026-02-21", response);

        expect(result).toBe(true);
        expect(upsertMock.upsert).toHaveBeenCalledWith(
          {
            user_id: "user-123",
            missed_date: "2026-02-21",
            response,
          },
          { onConflict: "user_id,missed_date" },
        );
      }
    });
  });
});
