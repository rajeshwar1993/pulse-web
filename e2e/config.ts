/**
 * E2E test configuration.
 *
 * Reads Supabase credentials from environment variables, which are
 * loaded from pulse-web/.env.local by playwright.config.ts.
 *
 * Connects to the REAL Supabase server (staging/production) — not local.
 */

// ─── Supabase connection (staging server) ────────────────────────
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ─── App URL ─────────────────────────────────────────────────────
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Test Users ──────────────────────────────────────────────────
//
// USER_A, USER_B: Pre-created via admin in global-setup (for login)
// USER_C, USER_D: For signup flow testing (NOT pre-created)
// USER_E, USER_F: For invite accept/decline (created mid-test via admin)
// USER_G, USER_H: For connection request flows (created mid-test via admin)
// USER_I, USER_J: For seat lifecycle / edge cases (created mid-test via admin)

export interface TestUser {
  email: string;
  password: string;
  displayName: string;
}

export const TEST_USER_A: TestUser = {
  email: 'e2e-user-a@test.local',
  password: 'TestPass123!',
  displayName: 'Test User A',
};

export const TEST_USER_B: TestUser = {
  email: 'e2e-user-b@test.local',
  password: 'TestPass123!',
  displayName: 'Test User B',
};

export const TEST_USER_C: TestUser = {
  email: 'e2e-user-c@test.local',
  password: 'TestPass123!',
  displayName: 'Test User C',
};

export const TEST_USER_D: TestUser = {
  email: 'e2e-user-d@test.local',
  password: 'TestPass123!',
  displayName: 'Test User D',
};

export const TEST_USER_E: TestUser = {
  email: 'e2e-user-e@test.local',
  password: 'TestPass123!',
  displayName: 'Test User E',
};

export const TEST_USER_F: TestUser = {
  email: 'e2e-user-f@test.local',
  password: 'TestPass123!',
  displayName: 'Test User F',
};

export const TEST_USER_G: TestUser = {
  email: 'e2e-user-g@test.local',
  password: 'TestPass123!',
  displayName: 'Test User G',
};

export const TEST_USER_H: TestUser = {
  email: 'e2e-user-h@test.local',
  password: 'TestPass123!',
  displayName: 'Test User H',
};

export const TEST_USER_I: TestUser = {
  email: 'e2e-user-i@test.local',
  password: 'TestPass123!',
  displayName: 'Test User I',
};

export const TEST_USER_J: TestUser = {
  email: 'e2e-user-j@test.local',
  password: 'TestPass123!',
  displayName: 'Test User J',
};

/** All test users for iteration */
export const ALL_TEST_USERS: TestUser[] = [
  TEST_USER_A,
  TEST_USER_B,
  TEST_USER_C,
  TEST_USER_D,
  TEST_USER_E,
  TEST_USER_F,
  TEST_USER_G,
  TEST_USER_H,
  TEST_USER_I,
  TEST_USER_J,
];

// ─── Auth state file paths ───────────────────────────────────────
export const AUTH_STATE_USER_A = 'e2e/.auth/user-a.json';
export const AUTH_STATE_USER_B = 'e2e/.auth/user-b.json';
