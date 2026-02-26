import { describe, expect, it } from "vitest";
import type { Seat } from "@/lib/types/seat";
import { deriveSeatState } from "../seats";

function makeSeat(overrides: Partial<Seat> = {}): Seat {
  return {
    id: "seat-1",
    owner_id: "user-1",
    seat_number: 1,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    connection_id: null,
    invite_code_id: null,
    connection_request_id: null,
    created_at: new Date().toISOString(),
    renewed_at: null,
    ...overrides,
  };
}

describe("deriveSeatState", () => {
  it("returns 'empty' when no FKs and not expired", () => {
    const seat = makeSeat();
    expect(deriveSeatState(seat)).toBe("empty");
  });

  it("returns 'occupied' when connection_id is set and not expired", () => {
    const seat = makeSeat({ connection_id: "conn-1" });
    expect(deriveSeatState(seat)).toBe("occupied");
  });

  it("returns 'pending' when invite_code_id is set and not expired", () => {
    const seat = makeSeat({ invite_code_id: "invite-1" });
    expect(deriveSeatState(seat)).toBe("pending");
  });

  it("returns 'pending' when connection_request_id is set and not expired", () => {
    const seat = makeSeat({ connection_request_id: "req-1" });
    expect(deriveSeatState(seat)).toBe("pending");
  });

  it("returns 'expired' when expires_at is in the past", () => {
    const seat = makeSeat({
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    expect(deriveSeatState(seat)).toBe("expired");
  });

  it("returns 'expired' even when connection_id is set if expired", () => {
    const seat = makeSeat({
      connection_id: "conn-1",
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    expect(deriveSeatState(seat)).toBe("expired");
  });

  it("returns 'expired' even when invite_code_id is set if expired", () => {
    const seat = makeSeat({
      invite_code_id: "invite-1",
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    expect(deriveSeatState(seat)).toBe("expired");
  });

  it("prioritizes connection_id over invite_code_id when both set", () => {
    const seat = makeSeat({
      connection_id: "conn-1",
      invite_code_id: "invite-1",
    });
    expect(deriveSeatState(seat)).toBe("occupied");
  });
});
