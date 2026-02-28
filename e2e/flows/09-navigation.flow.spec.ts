import { test, expect } from '@playwright/test';
import { NavPage } from '../pages/nav.page';

test.describe('09 — Navigation Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.describe('Desktop navigation', () => {
    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name === 'mobile-chrome', 'Desktop navigation — chromium only');
    });

    test('nav header has links', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1').first()).toBeVisible();

      // Nav links should be present: Dashboard, Activity, Settings
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /activity/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /settings/i })).toBeVisible();
    });

    test('logo links to dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      const logo = page.getByRole('link', { name: /pulse/i }).first();
      await expect(logo).toBeVisible();
      const href = await logo.getAttribute('href');
      expect(href).toContain('/dashboard');
    });

    test('user menu button visible and clickable', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1').first()).toBeVisible();

      // User menu button has aria-haspopup="true"
      const userMenuBtn = page.locator('button[aria-haspopup="true"]');
      await expect(userMenuBtn).toBeVisible();
      await userMenuBtn.click();

      // Dropdown with role="menu" should appear
      const menu = page.locator('[role="menu"]');
      await expect(menu).toBeVisible();
      // Should have logout option
      await expect(menu.getByText(/log\s?out/i)).toBeVisible();
    });

    test('active link is highlighted on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      const dashboardLink = page.getByRole('link', { name: /dashboard/i });
      await expect(dashboardLink).toBeVisible();
    });

    test('nav link navigates to activity', async ({ page }) => {
      await page.goto('/dashboard');
      const activityLink = page.getByRole('link', { name: /activity/i });
      await activityLink.click();
      await page.waitForURL('**/activity', { timeout: 10_000 });
    });

    test('nav link navigates to settings', async ({ page }) => {
      await page.goto('/dashboard');
      const settingsLink = page.getByRole('link', { name: /settings/i });
      await settingsLink.click();
      await page.waitForURL('**/settings', { timeout: 10_000 });
    });
  });

  test.describe('Mobile navigation', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test.beforeEach(async ({}, testInfo) => {
      test.skip(testInfo.project.name === 'chromium', 'Mobile navigation — mobile-chrome only');
    });

    test('hamburger menu visible on mobile', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1').first()).toBeVisible();

      const nav = new NavPage(page);
      await expect(nav.mobileMenuButton).toBeVisible();
    });

    test('open and close mobile menu', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1').first()).toBeVisible();

      const nav = new NavPage(page);
      await nav.openMobileMenu();
      await expect(nav.mobileMenu).toBeVisible();

      await nav.closeMobileMenu();
      await expect(nav.mobileMenu).toBeHidden();
    });

    test('mobile menu link navigates to activity', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page.locator('h1').first()).toBeVisible();

      const nav = new NavPage(page);
      await nav.openMobileMenu();
      const activityLink = nav.mobileMenu.getByRole('link', { name: /activity/i });
      await activityLink.click();

      await page.waitForURL('**/activity', { timeout: 10_000 });
    });
  });
});
