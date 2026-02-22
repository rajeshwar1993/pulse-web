/**
 * E2E test configuration.
 *
 * Reads Supabase credentials from environment variables, which are
 * loaded from pulse-web/.env.local by playwright.config.ts.
 *
 * Connects to the REAL Supabase server (staging/production) — not local.
 */

// Supabase connection (staging server)
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// App URL
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test user credentials — created via Admin API in auth.setup.ts
export const TEST_USER_A = {
  email: 'e2e-user-a@test.local',
  password: 'TestPass123!',
  displayName: 'Test User A',
} as const;

export const TEST_USER_B = {
  email: 'e2e-user-b@test.local',
  password: 'TestPass123!',
  displayName: 'Test User B',
} as const;

// Playwright auth state file path
export const AUTH_STATE_PATH = 'e2e/.auth/user.json';
