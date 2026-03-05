"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Identifies the current Supabase user in PostHog.
 * Call once from a top-level client component (e.g., DashboardContent).
 */
export function usePosthogIdentify() {
  const identified = useRef(false);

  useEffect(() => {
    if (identified.current) return;

    async function identify() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          identified.current = true;
          posthog.identify(user.id, { email: user.email });
        }
      } catch {
        // Silently fail — user identification is non-critical
      }
    }

    identify();
  }, []);
}
