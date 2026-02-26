import type { SupabaseClient } from "@supabase/supabase-js";
import type { DashboardSeat, Seat, SeatState } from "@/lib/types/seat";
import { getEffectiveStreak, getStartOfPulseDay } from "@/lib/utils/streak";

/**
 * Derive seat state from expiry and FK presence.
 * Exported for testing.
 */
export function deriveSeatState(seat: Seat): SeatState {
  if (new Date(seat.expires_at) <= new Date()) {
    return "expired";
  }
  if (seat.connection_id) {
    return "occupied";
  }
  if (seat.invite_code_id || seat.connection_request_id) {
    return "pending";
  }
  return "empty";
}

/**
 * Fetch all seats for a user with connections, profiles, and pending info.
 * Works with any Supabase client (server or browser).
 */
export async function fetchSeatsWithConnections(
  client: SupabaseClient,
  userId: string,
): Promise<DashboardSeat[]> {
  // 1. Fetch all seats for the user
  const { data: seatsData, error: seatsError } = await client
    .from("connection_seats")
    .select("*")
    .eq("owner_id", userId)
    .order("seat_number", { ascending: true });

  if (seatsError) throw seatsError;
  if (!seatsData || seatsData.length === 0) return [];

  const seats = seatsData as Seat[];

  // 2. Collect IDs for batch fetches
  const connectionIds = seats
    .filter((s) => s.connection_id)
    .map((s) => s.connection_id as string);

  const inviteCodeIds = seats
    .filter((s) => s.invite_code_id)
    .map((s) => s.invite_code_id as string);

  const connectionRequestIds = seats
    .filter((s) => s.connection_request_id)
    .map((s) => s.connection_request_id as string);

  // 3. Batch fetch connections with profiles
  // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
  let connectionsMap = new Map<string, any>();
  if (connectionIds.length > 0) {
    const { data: connectionsData, error: connError } = await client
      .from("connections")
      .select(
        `
        id, user_a_id, user_b_id, status, created_at,
        user_a_profile:profiles!connections_user_a_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date),
        user_b_profile:profiles!connections_user_b_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date)
      `,
      )
      .in("id", connectionIds);

    if (connError) throw connError;

    // Get today's pulses for connected users
    const pulseDayStart = getStartOfPulseDay();
    // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
    const connectedUserIds = (connectionsData ?? []).map((c: any) =>
      c.user_a_id === userId ? c.user_b_id : c.user_a_id,
    );

    const { data: todayPulses } =
      connectedUserIds.length > 0
        ? await client
            .from("daily_pulses")
            .select("user_id, created_at")
            .in("user_id", connectedUserIds)
            .gte("created_at", pulseDayStart.toISOString())
        : { data: [] };

    const pulseMap = new Map(
      (todayPulses ?? []).map((p) => [p.user_id, p.created_at]),
    );

    // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
    for (const conn of connectionsData ?? []) {
      const other =
        (conn as any).user_a_id === userId
          ? (conn as any).user_b_profile
          : (conn as any).user_a_profile;
      const pulseCreatedAt = pulseMap.get(other.id);

      connectionsMap.set(conn.id, {
        id: conn.id,
        userId: other.id,
        name: other.display_name,
        avatar: other.avatar_url,
        timezone: other.timezone ?? "UTC",
        status: (conn as any).status,
        pulseTime: pulseCreatedAt ? new Date(pulseCreatedAt) : null,
        currentStreak: getEffectiveStreak(
          other.current_streak ?? 0,
          other.last_pulse_date ?? null,
        ),
      });
    }
  }

  // 4. Batch fetch invite codes
  // biome-ignore lint/suspicious/noExplicitAny: Supabase returns dynamic shape
  let inviteCodesMap = new Map<string, any>();
  if (inviteCodeIds.length > 0) {
    const { data: invitesData, error: invError } = await client
      .from("invite_codes")
      .select("id, code, created_at")
      .in("id", inviteCodeIds);

    if (invError) throw invError;

    for (const inv of invitesData ?? []) {
      inviteCodesMap.set(inv.id, inv);
    }
  }

  // 5. Batch fetch connection requests
  // biome-ignore lint/suspicious/noExplicitAny: Supabase returns dynamic shape
  let requestsMap = new Map<string, any>();
  if (connectionRequestIds.length > 0) {
    const { data: requestsData, error: reqError } = await client
      .from("connection_requests")
      .select(
        `
        id, to_user_id, created_at,
        to_profile:profiles!connection_requests_to_user_id_fkey(email)
      `,
      )
      .in("id", connectionRequestIds);

    if (reqError) throw reqError;

    for (const req of requestsData ?? []) {
      requestsMap.set(req.id, req);
    }
  }

  // 6. Assemble DashboardSeat array
  return seats.map((seat) => {
    const state = deriveSeatState(seat);
    const result: DashboardSeat = {
      id: seat.id,
      seatNumber: seat.seat_number,
      state,
      expiresAt: new Date(seat.expires_at),
    };

    if (seat.connection_id && connectionsMap.has(seat.connection_id)) {
      result.connection = connectionsMap.get(seat.connection_id);
    }

    if (seat.invite_code_id && inviteCodesMap.has(seat.invite_code_id)) {
      const inv = inviteCodesMap.get(seat.invite_code_id);
      result.pendingInfo = {
        type: "invite_code",
        label: inv.code,
        createdAt: new Date(inv.created_at),
      };
    }

    if (
      seat.connection_request_id &&
      requestsMap.has(seat.connection_request_id)
    ) {
      const req = requestsMap.get(seat.connection_request_id);
      result.pendingInfo = {
        type: "connection_request",
        label: req.to_profile?.email ?? "Pending request",
        createdAt: new Date(req.created_at),
      };
    }

    return result;
  });
}
