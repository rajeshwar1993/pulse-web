import { supabase } from "@/lib/supabase/client";
import type { ConnectionWithProfile, InviteCode } from "@/lib/types/connection";
import { getEffectiveStreak } from "@/lib/utils/streak";

// biome-ignore lint/complexity/noStaticOnlyClass: service pattern groups related methods under a namespace
export class ConnectionService {
  /**
   * Get all active connections for the current user
   * Returns normalized list with other user's profile
   */
  static async getActiveConnections(): Promise<ConnectionWithProfile[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Single-row model: current user can be user_a_id or user_b_id.
    // Join both sides and pick the "other" user's profile.
    const { data, error } = await supabase
      .from("connections")
      .select(
        `
        id,
        user_a_id,
        user_b_id,
        created_at,
        user_a_profile:profiles!connections_user_a_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date),
        user_b_profile:profiles!connections_user_b_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date)
      `,
      )
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .is("removed_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
    return data.map((conn: any) => {
      const other =
        conn.user_a_id === user.id
          ? conn.user_b_profile
          : conn.user_a_profile;
      return {
        id: conn.id,
        user_id: other.id,
        display_name: other.display_name,
        avatar_url: other.avatar_url,
        timezone: other.timezone ?? "UTC",
        status: "active",
        created_at: conn.created_at,
        current_streak: getEffectiveStreak(
          other.current_streak ?? 0,
          other.last_pulse_date ?? null,
        ),
        longest_streak: other.longest_streak ?? 0,
      };
    });
  }

  /**
   * Get connection count for current user
   */
  static async getConnectionCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .is("removed_at", null);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Check if connection exists between current user and another user
   */
  static async connectionExists(otherUserId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Compute canonical ordering client-side for a single exact index lookup
    const [a, b] =
      user.id < otherUserId
        ? [user.id, otherUserId]
        : [otherUserId, user.id];

    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .eq("user_a_id", a)
      .eq("user_b_id", b)
      .is("removed_at", null);

    if (error) throw error;
    return (count || 0) > 0;
  }

  /**
   * Remove (soft delete) a connection
   */
  static async removeConnection(connectionId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("connections")
      .update({
        removed_at: new Date().toISOString(),
        removed_by: user.id,
      })
      .eq("id", connectionId);

    if (error) throw error;
  }

  /**
   * Generate a new invite code
   */
  static async generateInviteCode(): Promise<InviteCode> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Call database function to generate unique code
    const { data: code, error: codeError } = await supabase.rpc(
      "generate_invite_code",
    );

    if (codeError) throw codeError;

    // Insert invite code
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data, error } = await supabase
      .from("invite_codes")
      .insert({
        code,
        creator_id: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as InviteCode;
  }

  /**
   * Validate an invite code
   */
  static async validateInviteCode(code: string): Promise<InviteCode | null> {
    const { data, error } = await supabase
      .from("invite_codes")
      .select()
      .eq("code", code)
      .is("accepted_by", null)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data as InviteCode | null;
  }

  /**
   * Accept an invite code and create connection.
   * Uses a database RPC for atomic execution — all operations
   * succeed or fail together within a single transaction.
   */
  static async acceptInviteCode(code: string): Promise<void> {
    const { error } = await supabase.rpc("accept_invite", { p_code: code });
    if (error) throw error;
  }

  /**
   * Get active invite codes for current user
   */
  static async getMyInviteCodes(): Promise<InviteCode[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("invite_codes")
      .select()
      .eq("creator_id", user.id)
      .gte("expires_at", new Date().toISOString())
      .is("accepted_by", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as InviteCode[];
  }
}
