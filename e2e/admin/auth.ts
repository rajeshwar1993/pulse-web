/**
 * Auth admin utilities — create/delete users via Supabase Admin API.
 */
import { getAdmin } from "./client";

/**
 * Create a new auth user with email confirmed.
 * Returns the user ID.
 */
export async function createAuthUser(
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  const { data, error } = await getAdmin().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  }
  return data.user.id;
}

/**
 * Delete an auth user by ID.
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const { error } = await getAdmin().auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`Failed to delete auth user ${userId}: ${error.message}`);
  }
}

/**
 * Look up a user ID by email via the Admin Auth API.
 * Test user IDs are dynamic on remote, so this resolves them at runtime.
 */
export async function getUserIdByEmail(email: string): Promise<string> {
  const { data: users } = await getAdmin().auth.admin.listUsers();
  const user = users?.users?.find((u) => u.email === email);
  if (!user) throw new Error(`Test user not found: ${email}`);
  return user.id;
}

/**
 * List all auth users.
 */
export async function listAllAuthUsers() {
  const { data } = await getAdmin().auth.admin.listUsers();
  return data?.users || [];
}

/**
 * Delete ALL auth users. Use with caution — for nuclear wipe only.
 */
export async function deleteAllAuthUsers(): Promise<void> {
  const users = await listAllAuthUsers();
  for (const user of users) {
    await deleteAuthUser(user.id);
  }
}

/**
 * Ensure a test user exists (create via Admin API if not).
 * Returns the user ID.
 */
export async function ensureAuthUser(
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  const users = await listAllAuthUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) return existing.id;
  return createAuthUser(email, password, displayName);
}
