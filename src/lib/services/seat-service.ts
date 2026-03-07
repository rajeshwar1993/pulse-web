import { fetchSeatsWithConnections } from "@/lib/queries/seats";
import { supabase } from "@/lib/supabase/client";
import type { InviteCode } from "@/lib/types/connection";
import type { DashboardSeat } from "@/lib/types/seat";

// biome-ignore lint/complexity/noStaticOnlyClass: service pattern groups related methods under a namespace
export class SeatService {
  /**
   * Get all seats for the current user with connection/pending info
   */
  static async getSeats(): Promise<DashboardSeat[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    return fetchSeatsWithConnections(supabase, user.id);
  }

  /**
   * Renew an expired seat (extends by 7 days, reactivates paused connection)
   */
  static async renewSeat(seatId: string): Promise<void> {
    const { error } = await supabase.rpc("renew_seat", {
      p_seat_id: seatId,
    });
    if (error) throw error;
  }

  /**
   * Cancel a pending invite or connection request on a seat
   */
  static async cancelSeatInvite(seatId: string): Promise<void> {
    const { error } = await supabase.rpc("cancel_seat_invite", {
      p_seat_id: seatId,
    });
    if (error) throw error;
  }

  /**
   * Generate an invite code and link it to a specific seat
   */
  static async generateInviteForSeat(seatId: string): Promise<InviteCode> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Generate unique code via DB function
    const { data: code, error: codeError } = await supabase.rpc(
      "generate_invite_code",
    );
    if (codeError) throw codeError;

    // Insert invite code with 30-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data: inviteCode, error: insertError } = await supabase
      .from("invite_codes")
      .insert({
        code,
        creator_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Link invite code to seat
    const { error: linkError } = await supabase.rpc("link_invite_to_seat", {
      p_seat_id: seatId,
      p_invite_code_id: inviteCode.id,
    });
    if (linkError) throw linkError;

    return inviteCode as InviteCode;
  }

  /**
   * Send a connection request and link it to a specific seat
   */
  static async sendRequestForSeat(
    seatId: string,
    email: string,
  ): Promise<string | null> {
    const { data, error } = await supabase.rpc("send_connection_request", {
      p_to_email: email,
      p_seat_id: seatId,
    });

    if (error) throw error;
    return data as string | null;
  }
}
