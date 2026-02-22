import { test as setup, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B, AUTH_STATE_PATH } from './config';
import { setupTestUser } from './helpers/supabase-admin';

/**
 * Playwright auth setup project.
 *
 * 1. Creates test users on the remote Supabase server via Admin API
 *    (skips if they already exist).
 * 2. Signs in as Test User A via the login page so cookies are set
 *    correctly by the app's own @supabase/ssr client.
 * 3. Saves the authenticated browser state to a file that all test
 *    projects reuse.
 *
 * This runs once per test suite, not per test.
 */
setup('create test users and authenticate', async ({ page }) => {
  // Ensure both test users exist on the remote server (idempotent)
  await setupTestUser(TEST_USER_A);
  await setupTestUser(TEST_USER_B);

  // Sign in as User A via the login page
  await page.goto('/auth/login');
  await page.locator('#login-email').fill(TEST_USER_A.email);
  await page.locator('#login-password').fill(TEST_USER_A.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard (profile exists)
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.locator('h1').first()).toBeVisible();

  // Save authenticated browser state for all tests to reuse
  await page.context().storageState({ path: AUTH_STATE_PATH });
});
