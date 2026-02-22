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

    const { data, error } = await supabase
      .from("connections")
      .select(
        `
        id,
        from_user_id,
        to_user_id,
        created_at,
        from_profile:profiles!connections_from_user_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date),
        to_profile:profiles!connections_to_user_id_fkey(id, display_name, avatar_url, timezone, current_streak, longest_streak, last_pulse_date)
      `,
      )
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .is("removed_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Normalize connections to show the "other" user
    // biome-ignore lint/suspicious/noExplicitAny: Supabase join query returns dynamic shape
    return data.map((conn: any) => {
      const isFromUser = conn.from_user_id === user.id;
      const otherProfile = isFromUser ? conn.to_profile : conn.from_profile;

      return {
        id: conn.id,
        user_id: otherProfile.id,
        display_name: otherProfile.display_name,
        avatar_url: otherProfile.avatar_url,
        timezone: otherProfile.timezone ?? "UTC",
        status: "active", // Will be enhanced with pulse status in Unit 4
        created_at: conn.created_at,
        current_streak: getEffectiveStreak(
          otherProfile.current_streak ?? 0,
          otherProfile.last_pulse_date ?? null,
        ),
        longest_streak: otherProfile.longest_streak ?? 0,
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
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
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

    const { count, error } = await supabase
      .from("connections")
      .select("*", { count: "exact", head: true })
      .or(
        `and(from_user_id.eq.${user.id},to_user_id.eq.${otherUserId}),` +
          `and(from_user_id.eq.${otherUserId},to_user_id.eq.${user.id})`,
      )
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
   * Accept an invite code and create bidirectional connection.
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
