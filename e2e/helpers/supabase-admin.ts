/**
 * Supabase admin client for E2E tests.
 *
 * Uses the service_role key to bypass RLS — allowing tests to:
 * - Create/delete test users via Auth Admin API
 * - Verify database state after user actions
 * - Clean up test data between tests
 */
import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  TEST_USER_A,
  TEST_USER_B,
} from '../config';

function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
        'Add SUPABASE_SERVICE_ROLE_KEY to pulse-web/.env.local ' +
        '(find it in Supabase Dashboard > Project Settings > API).',
    );
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Lazily initialised — only throws when actually used, not on import. */
let _admin: ReturnType<typeof getAdminClient> | null = null;
function getAdmin() {
  if (!_admin) _admin = getAdminClient();
  return _admin;
}

/**
 * Ensure a test user exists (create via Admin API if not).
 * Returns the user ID.
 */
export async function ensureTestUser(
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  // Try to find existing user
  const { data: existingUsers } =
    await getAdmin().auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  if (existing) {
    return existing.id;
  }

  // Create new user (email auto-confirmed via Admin API)
  const { data: created, error } =
    await getAdmin().auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

  if (error) {
    throw new Error(`Failed to create test user ${email}: ${error.message}`);
  }

  return created.user.id;
}

/**
 * Ensure the test user has a profile in the profiles table.
 * Creates one if it doesn't exist.
 */
export async function ensureProfile(
  userId: string,
  email: string,
  displayName: string,
): Promise<void> {
  const { data: existing } = await getAdmin()
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  const { error } = await getAdmin().from('profiles').insert({
    id: userId,
    email,
    display_name: displayName,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
    timezone: 'UTC',
  });

  if (error) {
    throw new Error(`Failed to create profile for ${email}: ${error.message}`);
  }
}

/**
 * Set up a complete test user (auth + profile). Returns the user ID.
 */
export async function setupTestUser(user: {
  email: string;
  password: string;
  displayName: string;
}): Promise<string> {
  const userId = await ensureTestUser(
    user.email,
    user.password,
    user.displayName,
  );
  await ensureProfile(userId, user.email, user.displayName);
  return userId;
}

// ─── DB Query Helpers ────────────────────────────────────────────

/**
 * Get a user's profile by ID.
 */
export async function getProfile(userId: string) {
  const { data, error } = await getAdmin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw new Error(`Failed to get profile: ${error.message}`);
  return data;
}

/**
 * Get today's pulses for a user (since 4 AM local / UTC for tests).
 */
export async function getTodayPulses(userId: string) {
  const now = new Date();
  const resetHour = 4;
  const pulseStart = new Date(now);
  pulseStart.setHours(resetHour, 0, 0, 0);
  if (now.getHours() < resetHour) {
    pulseStart.setDate(pulseStart.getDate() - 1);
  }

  const { data, error } = await getAdmin()
    .from('daily_pulses')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', pulseStart.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to get pulses: ${error.message}`);
  return data;
}

/**
 * Delete all pulses for a user (cleanup between tests).
 */
export async function deleteUserPulses(userId: string) {
  const { error } = await getAdmin()
    .from('daily_pulses')
    .delete()
    .eq('user_id', userId);
  if (error) throw new Error(`Failed to delete pulses: ${error.message}`);
}

/**
 * Get active connections for a user.
 */
export async function getActiveConnections(userId: string) {
  const { data, error } = await getAdmin()
    .from('connections')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .is('removed_at', null);
  if (error) throw new Error(`Failed to get connections: ${error.message}`);
  return data;
}

/**
 * Delete all connections involving a user (cleanup).
 */
export async function deleteUserConnections(userId: string) {
  const { error } = await getAdmin()
    .from('connections')
    .delete()
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
  if (error) throw new Error(`Failed to delete connections: ${error.message}`);
}

/**
 * Delete all invite codes created by a user (cleanup).
 */
export async function deleteUserInviteCodes(userId: string) {
  const { error } = await getAdmin()
    .from('invite_codes')
    .delete()
    .eq('creator_id', userId);
  if (error)
    throw new Error(`Failed to delete invite codes: ${error.message}`);
}

/**
 * Get invite codes created by a user.
 */
export async function getInviteCodes(userId: string) {
  const { data, error } = await getAdmin()
    .from('invite_codes')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to get invite codes: ${error.message}`);
  return data;
}

/**
 * Update a user's profile fields (e.g. display_name, avatar_url).
 */
export async function updateProfile(
  userId: string,
  fields: { display_name?: string; avatar_url?: string },
) {
  const { error } = await getAdmin()
    .from('profiles')
    .update(fields)
    .eq('id', userId);
  if (error) throw new Error(`Failed to update profile: ${error.message}`);
}

// ─── Test Data Setup Helpers ─────────────────────────────────────

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
 * Insert an invite_codes record directly for a user.
 * Returns the created invite code record.
 */
export async function createInviteCodeForUser(userId: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data, error } = await getAdmin()
    .from('invite_codes')
    .insert({
      creator_id: userId,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create invite code: ${error.message}`);
  return data;
}

/**
 * Insert a connection record between two users.
 * Creates a single directional record (A → B).
 */
export async function createConnectionBetween(
  userAId: string,
  userBId: string,
) {
  const { error } = await getAdmin().from('connections').insert({
    from_user_id: userAId,
    to_user_id: userBId,
  });
  if (error)
    throw new Error(`Failed to create connection: ${error.message}`);
}

/**
 * Insert a daily_pulses record for a user (marks them as pulsed today).
 */
export async function insertPulseForUser(userId: string) {
  const { error } = await getAdmin().from('daily_pulses').insert({
    user_id: userId,
  });
  if (error) throw new Error(`Failed to insert pulse: ${error.message}`);
}

// ─── Cleanup ─────────────────────────────────────────────────────

/**
 * Clean up all test data for both test users.
 * Call this in test beforeAll/afterAll to reset state.
 */
export async function cleanupTestData() {
  // Find test user IDs (they might have been created with different UUIDs)
  const { data: users } = await getAdmin().auth.admin.listUsers();
  const testEmails: string[] = [TEST_USER_A.email, TEST_USER_B.email];
  const testUserIds = (users?.users || [])
    .filter((u) => testEmails.includes(u.email || ''))
    .map((u) => u.id);

  for (const userId of testUserIds) {
    await deleteUserPulses(userId);
    await deleteUserInviteCodes(userId);
    await deleteUserConnections(userId);
  }
}
