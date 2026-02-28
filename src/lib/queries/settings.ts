import type { SupabaseClient } from "@supabase/supabase-js";
import { getLocale } from "next-intl/server";

export interface SettingsData {
  locale: string;
  profile: { display_name: string; avatar_url: string } | undefined;
}

/**
 * Fetches all data needed by the settings page.
 *
 * Shared between appview and browser settings pages to eliminate duplication.
 * The caller must already have verified that `userId` exists.
 */
export async function fetchSettingsData(
  supabase: SupabaseClient,
  userId: string,
): Promise<SettingsData> {
  const [locale, { data: profile }] = await Promise.all([
    getLocale(),
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", userId)
      .single(),
  ]);

  return {
    locale,
    profile: profile ?? undefined,
  };
}
