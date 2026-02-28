import { test, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B } from '../config';
import { LoginPage } from '../pages/auth/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { getUserIdByEmail } from '../admin/auth';
import { getProfile } from '../admin/profiles';

test.describe('01 — Auth Login Flow @smoke', () => {
  test.describe.configure({ mode: 'serial' });

  test('User A logs in successfully and reaches dashboard', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_A.email, TEST_USER_A.password);
    await loginPage.expectRedirectToDashboard();

    const greeting = await dashboard.getGreetingText();
    expect(greeting).toContain(TEST_USER_A.displayName);

    await context.close();
  });

  test('User B logs in with fresh context', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_B.email, TEST_USER_B.password);
    await loginPage.expectRedirectToDashboard();
    await expect(page.locator('h1').first()).toBeVisible();

    await context.close();
  });

  test('invalid credentials show error alert', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('nonexistent@test.local', 'WrongPass999!');
    await loginPage.expectError();

    await context.close();
  });

  test('login page has signup and forgot-password links', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await expect(loginPage.signupLink).toBeVisible();
    await expect(loginPage.forgotPasswordLink).toBeVisible();

    await context.close();
  });

  test('already-authenticated user visiting /auth/login redirects to /dashboard', async ({ page }) => {
    // page uses User A's storageState (from config)
    await page.goto('/auth/login');
    await page.waitForURL('**/dashboard', { timeout: 15_000 });
  });

  test('DB verify: profile exists after login', async () => {
    const userId = await getUserIdByEmail(TEST_USER_A.email);
    const profile = await getProfile(userId);
    expect(profile).toBeTruthy();
    expect(profile.display_name).toBe(TEST_USER_A.displayName);
  });
});
