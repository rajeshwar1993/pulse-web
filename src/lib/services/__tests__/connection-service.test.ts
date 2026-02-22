import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionService } from "../connection-service";

// Build a chainable mock that records calls and returns configurable data
function createQueryMock() {
  // biome-ignore lint/suspicious/noExplicitAny: mock result shape varies by test
  let result: { data?: any; error?: any; count?: any } = {
    data: null,
    error: null,
  };

  // biome-ignore lint/suspicious/noExplicitAny: chainable mock dynamically builds methods
  const chain: any = {};
  const methods = [
    "select",
    "insert",
    "update",
    "eq",
    "or",
    "is",
    "gte",
    "order",
    "single",
    "maybeSingle",
  ];

  for (const method of methods) {
    chain[method] = vi.fn().mockImplementation(() => chain);
  }

  // Terminal methods resolve to result
  chain.single = vi.fn().mockImplementation(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn().mockImplementation(() => Promise.resolve(result));

  // Non-terminal: order returns result (used as terminal in some queries)
  chain.order = vi.fn().mockImplementation(() => Promise.resolve(result));

  // biome-ignore lint/suspicious/noThenProperty: intentional thenable mock for Supabase query chain
  // biome-ignore lint/suspicious/noExplicitAny: mock callback types
  chain.then = (resolve: any, reject: any) =>
    Promise.resolve(result).then(resolve, reject);

  chain._setResult = (r: typeof result) => {
    result = r;
  };

  return chain;
}

const mockUser = { id: "user-123" };
let queryMock: ReturnType<typeof createQueryMock>;
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "user-123" } } }),
    },
    from: vi.fn().mockImplementation(() => queryMock),
    // biome-ignore lint/suspicious/noExplicitAny: test mock passthrough
    rpc: (...args: any[]) => mockRpc(...args),
  },
}));

// Get reference to the mocked module
import { supabase } from "@/lib/supabase/client";

describe("ConnectionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock = createQueryMock();
    // Re-bind from to return fresh queryMock
    // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
    (supabase.from as any).mockImplementation(() => queryMock);
    // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
    });
  });

  describe("getActiveConnections", () => {
    it("should return normalized connections", async () => {
      const rawData = [
        {
          id: "conn-1",
          from_user_id: "user-123",
          to_user_id: "user-456",
          created_at: "2026-01-01",
          from_profile: {
            id: "user-123",
            display_name: "Alice",
            avatar_url: "/alice.png",
          },
          to_profile: {
            id: "user-456",
            display_name: "Bob",
            avatar_url: "/bob.png",
          },
        },
      ];

      queryMock._setResult({ data: rawData, error: null });

      const connections = await ConnectionService.getActiveConnections();

      expect(connections).toHaveLength(1);
      expect(connections[0]).toEqual({
        id: "conn-1",
        user_id: "user-456",
        display_name: "Bob",
        avatar_url: "/bob.png",
        status: "active",
        created_at: "2026-01-01",
        current_streak: 0,
        longest_streak: 0,
      });
    });

    it("should show the other user profile when current user is to_user", async () => {
      const rawData = [
        {
          id: "conn-2",
          from_user_id: "user-456",
          to_user_id: "user-123",
          created_at: "2026-01-02",
          from_profile: {
            id: "user-456",
            display_name: "Bob",
            avatar_url: "/bob.png",
          },
          to_profile: {
            id: "user-123",
            display_name: "Alice",
            avatar_url: "/alice.png",
          },
        },
      ];

      queryMock._setResult({ data: rawData, error: null });

      const connections = await ConnectionService.getActiveConnections();

      expect(connections[0].display_name).toBe("Bob");
      expect(connections[0].user_id).toBe("user-456");
    });

    it("should throw when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      await expect(ConnectionService.getActiveConnections()).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw on query error", async () => {
      queryMock._setResult({
        data: null,
        error: { message: "DB error" },
      });

      await expect(ConnectionService.getActiveConnections()).rejects.toEqual({
        message: "DB error",
      });
    });
  });

  describe("getConnectionCount", () => {
    it("should return count", async () => {
      queryMock._setResult({ count: 5, error: null });

      const count = await ConnectionService.getConnectionCount();
      expect(count).toBe(5);
    });

    it("should return 0 when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const count = await ConnectionService.getConnectionCount();
      expect(count).toBe(0);
    });

    it("should return 0 when count is null", async () => {
      queryMock._setResult({ count: null, error: null });

      const count = await ConnectionService.getConnectionCount();
      expect(count).toBe(0);
    });
  });

  describe("connectionExists", () => {
    it("should return true when connection exists", async () => {
      queryMock._setResult({ count: 1, error: null });

      const exists = await ConnectionService.connectionExists("user-456");
      expect(exists).toBe(true);
    });

    it("should return false when no connection", async () => {
      queryMock._setResult({ count: 0, error: null });

      const exists = await ConnectionService.connectionExists("user-456");
      expect(exists).toBe(false);
    });

    it("should return false when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const exists = await ConnectionService.connectionExists("user-456");
      expect(exists).toBe(false);
    });
  });

  describe("removeConnection", () => {
    it("should soft delete connection", async () => {
      queryMock._setResult({ data: null, error: null });

      await expect(
        ConnectionService.removeConnection("conn-1"),
      ).resolves.toBeUndefined();

      expect(supabase.from).toHaveBeenCalledWith("connections");
      expect(queryMock.update).toHaveBeenCalledWith(
        expect.objectContaining({
          removed_at: expect.any(String),
          removed_by: "user-123",
        }),
      );
    });

    it("should throw when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      await expect(
        ConnectionService.removeConnection("conn-1"),
      ).rejects.toThrow("Not authenticated");
    });
  });

  describe("generateInviteCode", () => {
    it("should generate and insert invite code", async () => {
      mockRpc.mockResolvedValue({ data: "XYZ789", error: null });
      const mockInvite = {
        id: "inv-1",
        code: "XYZ789",
        creator_id: "user-123",
        created_at: "2026-02-22",
        expires_at: "2026-03-24",
        accepted_by: null,
        accepted_at: null,
      };
      queryMock._setResult({ data: mockInvite, error: null });

      const result = await ConnectionService.generateInviteCode();

      expect(mockRpc).toHaveBeenCalledWith("generate_invite_code");
      expect(result).toEqual(mockInvite);
    });

    it("should throw when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      await expect(ConnectionService.generateInviteCode()).rejects.toThrow(
        "Not authenticated",
      );
    });

    it("should throw on RPC error", async () => {
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "RPC failed" },
      });

      await expect(ConnectionService.generateInviteCode()).rejects.toEqual({
        message: "RPC failed",
      });
    });
  });

  describe("validateInviteCode", () => {
    it("should return invite code when valid", async () => {
      const mockInvite = {
        id: "inv-1",
        code: "ABC123",
        creator_id: "user-456",
        created_at: "2026-02-22",
        expires_at: "2026-03-24",
        accepted_by: null,
        accepted_at: null,
      };
      queryMock._setResult({ data: mockInvite, error: null });

      const result = await ConnectionService.validateInviteCode("ABC123");
      expect(result).toEqual(mockInvite);
    });

    it("should return null when code not found", async () => {
      queryMock._setResult({ data: null, error: null });

      const result = await ConnectionService.validateInviteCode("INVALID");
      expect(result).toBeNull();
    });
  });

  describe("acceptInviteCode", () => {
    it("should call RPC with code", async () => {
      mockRpc.mockResolvedValue({ error: null });

      await ConnectionService.acceptInviteCode("ABC123");

      expect(mockRpc).toHaveBeenCalledWith("accept_invite", {
        p_code: "ABC123",
      });
    });

    it("should throw on RPC error", async () => {
      mockRpc.mockResolvedValue({
        error: { message: "Invalid code" },
      });

      await expect(ConnectionService.acceptInviteCode("BAD")).rejects.toEqual({
        message: "Invalid code",
      });
    });
  });

  describe("getMyInviteCodes", () => {
    it("should return invite codes", async () => {
      const mockCodes = [{ id: "inv-1", code: "ABC", creator_id: "user-123" }];
      queryMock._setResult({ data: mockCodes, error: null });

      const result = await ConnectionService.getMyInviteCodes();
      expect(result).toEqual(mockCodes);
    });

    it("should return empty array when not authenticated", async () => {
      // biome-ignore lint/suspicious/noExplicitAny: vi.fn() mock cast
      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: null },
      });

      const result = await ConnectionService.getMyInviteCodes();
      expect(result).toEqual([]);
    });
  });
});
