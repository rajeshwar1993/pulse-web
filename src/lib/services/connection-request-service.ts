import { supabase } from "@/lib/supabase/client";
import type { ConnectionRequestWithProfile } from "@/lib/types/connection";

// biome-ignore lint/complexity/noStaticOnlyClass: service pattern groups related methods under a namespace
export class ConnectionRequestService {
  /**
   * Send a connection request to a user by email.
   * Returns the request ID if the user was found, null if not.
   * The client always shows "Invite sent!" regardless (privacy-safe).
   */
  static async sendRequest(email: string): Promise<string | null> {
    const { data, error } = await supabase.rpc("send_connection_request", {
      p_to_email: email,
    });

    if (error) throw error;
    return data as string | null;
  }

  /**
   * Fetch pending connection requests for the current user (as receiver),
   * with sender profile information.
   */
  static async getPendingRequests(): Promise<ConnectionRequestWithProfile[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("connection_requests")
      .select(
        `
        id,
        from_user_id,
        to_user_id,
        status,
        created_at,
        responded_at,
        from_profile:profiles!connection_requests_from_user_id_fkey(id, display_name, avatar_url)
      `,
      )
      .eq("to_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as unknown as ConnectionRequestWithProfile[];
  }

  /**
   * Get the count of pending requests for the current user.
   */
  static async getPendingRequestCount(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { count, error } = await supabase
      .from("connection_requests")
      .select("*", { count: "exact", head: true })
      .eq("to_user_id", user.id)
      .eq("status", "pending");

    if (error) throw error;
    return count || 0;
  }

  /**
   * Accept a pending connection request.
   */
  static async acceptRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc("accept_connection_request", {
      p_request_id: requestId,
    });
    if (error) throw error;
  }

  /**
   * Decline a pending connection request.
   */
  static async declineRequest(requestId: string): Promise<void> {
    const { error } = await supabase.rpc("decline_connection_request", {
      p_request_id: requestId,
    });
    if (error) throw error;
  }
}
