/**
 * Profile admin utilities — CRUD operations on the profiles table.
 */
import { getAdmin } from "./client";

/**
 * Create a profile for a user.
 */
export async function createProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<void> {
  const { error } = await getAdmin()
    .from("profiles")
    .insert({
      id: userId,
      email,
      display_name: displayName,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
      timezone: "UTC",
    });
  if (error) {
    throw new Error(`Failed to create profile for ${email}: ${error.message}`);
  }
}

/**
 * Get a user's profile by ID.
 */
export async function getProfile(userId: string) {
  const { data, error } = await getAdmin()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw new Error(`Failed to get profile: ${error.message}`);
  return data;
}

/**
 * Update a user's profile fields.
 */
export async function updateProfile(
  userId: string,
  fields: { display_name?: string; avatar_url?: string },
): Promise<void> {
  const { error } = await getAdmin()
    .from("profiles")
    .update(fields)
    .eq("id", userId);
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
}

/**
 * Ensure a profile exists (create if not). Idempotent.
 */
export async function ensureProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<void> {
  const { data: existing } = await getAdmin()
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return;
  await createProfile(userId, email, displayName);
}

/**
 * Delete ALL profiles.
 */
export async function deleteAllProfiles(): Promise<void> {
  const { error } = await getAdmin()
    .from("profiles")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // match all
  if (error) throw new Error(`Failed to delete all profiles: ${error.message}`);
}
