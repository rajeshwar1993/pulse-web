import { test as setup, expect } from '@playwright/test';
import {
  TEST_USER_A,
  TEST_USER_B,
  AUTH_STATE_USER_A,
  AUTH_STATE_USER_B,
} from './config';

/**
 * Playwright auth setup project.
 *
 * Authenticates User A and User B via the login UI and saves
 * their browser states to separate files. All subsequent test
 * projects reuse these saved states.
 *
 * Seed users are already created by global-setup.ts.
 */

setup('authenticate User A', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('#login-email').fill(TEST_USER_A.email);
  await page.locator('#login-password').fill(TEST_USER_A.password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.locator('h1').first()).toBeVisible();

  await page.context().storageState({ path: AUTH_STATE_USER_A });
});

setup('authenticate User B', async ({ page }) => {
  await page.goto('/auth/login');
  await page.locator('#login-email').fill(TEST_USER_B.email);
  await page.locator('#login-password').fill(TEST_USER_B.password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.locator('h1').first()).toBeVisible();

  await page.context().storageState({ path: AUTH_STATE_USER_B });
});
