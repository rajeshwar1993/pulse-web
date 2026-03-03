import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Fetch wisdom phrases from the database.
 *
 * @param supabase - Authenticated Supabase client
 * @param locale - Locale to filter by (defaults to "en")
 * @returns Array of phrase strings
 */
export async function fetchWisdomPhrases(
  supabase: SupabaseClient,
  locale = "en",
): Promise<string[]> {
  const { data, error } = await supabase
    .from("wisdom_phrases")
    .select("phrase")
    .eq("locale", locale)
    .order("id");

  if (error) {
    console.error("Failed to fetch wisdom phrases:", error.message);
    return [];
  }

  return (data ?? []).map((row) => row.phrase);
}
