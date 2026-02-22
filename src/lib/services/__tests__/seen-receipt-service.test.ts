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

import { recordSeenReceipts } from "../seen-receipt-service";

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

const mockUser = { id: "viewer-001" };

describe("seen-receipt-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
  });

  describe("recordSeenReceipts", () => {
    it("should short-circuit and return true for empty array", async () => {
      const result = await recordSeenReceipts([], "2026-02-22");

      expect(result).toBe(true);
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should return false when not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const result = await recordSeenReceipts(
        ["user-002"],
        "2026-02-22",
      );

      expect(result).toBe(false);
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("should upsert a single seen receipt", async () => {
      const upsertMock = createUpsertMock({ data: null, error: null });
      mockFrom.mockReturnValue(upsertMock);

      const result = await recordSeenReceipts(
        ["user-002"],
        "2026-02-22",
      );

      expect(result).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("seen_receipts");
      expect(upsertMock.upsert).toHaveBeenCalledWith(
        [
          {
            viewer_id: "viewer-001",
            viewed_user_id: "user-002",
            pulse_date: "2026-02-22",
          },
        ],
        { onConflict: "viewer_id,viewed_user_id,pulse_date" },
      );
    });

    it("should batch upsert multiple seen receipts", async () => {
      const upsertMock = createUpsertMock({ data: null, error: null });
      mockFrom.mockReturnValue(upsertMock);

      const result = await recordSeenReceipts(
        ["user-002", "user-003", "user-004"],
        "2026-02-22",
      );

      expect(result).toBe(true);
      expect(upsertMock.upsert).toHaveBeenCalledWith(
        [
          {
            viewer_id: "viewer-001",
            viewed_user_id: "user-002",
            pulse_date: "2026-02-22",
          },
          {
            viewer_id: "viewer-001",
            viewed_user_id: "user-003",
            pulse_date: "2026-02-22",
          },
          {
            viewer_id: "viewer-001",
            viewed_user_id: "user-004",
            pulse_date: "2026-02-22",
          },
        ],
        { onConflict: "viewer_id,viewed_user_id,pulse_date" },
      );
    });

    it("should return false on database error", async () => {
      const upsertMock = createUpsertMock({
        data: null,
        error: { message: "DB error" },
      });
      mockFrom.mockReturnValue(upsertMock);

      const result = await recordSeenReceipts(
        ["user-002"],
        "2026-02-22",
      );

      expect(result).toBe(false);
    });
  });
});
