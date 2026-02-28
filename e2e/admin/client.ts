/**
 * Shared Supabase admin client singleton for E2E tests.
 *
 * Uses the service_role key to bypass RLS — allowing tests to:
 * - Create/delete test users via Auth Admin API
 * - Verify database state after user actions
 * - Clean up test data between tests
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '../config';

function createAdminClient(): SupabaseClient {
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
let _admin: SupabaseClient | null = null;

export function getAdmin(): SupabaseClient {
  if (!_admin) _admin = createAdminClient();
  return _admin;
}
