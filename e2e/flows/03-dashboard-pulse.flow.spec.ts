import { test, expect } from '@playwright/test';
import { TEST_USER_A } from '../config';
import { DashboardPage } from '../pages/dashboard.page';
import { getUserIdByEmail } from '../admin/auth';
import { deleteUserPulses, insertPulse } from '../admin/pulses';
import { verifyPulseExists, verifyNoPulseToday } from '../admin/verify';

test.describe('03 — Dashboard Pulse Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let userAId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
  });

  test.beforeEach(async () => {
    await deleteUserPulses(userAId);
  });

  test('greeting shows time-of-day and user name', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    const greeting = await dashboard.getGreetingText();
    expect(greeting).toContain(TEST_USER_A.displayName);
    expect(greeting).toMatch(/Good (morning|afternoon|evening)/i);
  });

  test('shows inactive status when not pulsed + DB verify', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(dashboard.statusTitle).toBeVisible();
    // Pulse button should be visible when inactive
    await expect(dashboard.pulseButton).toBeVisible();

    await verifyNoPulseToday(userAId);
  });

  test('send pulse → status updates + DB verify', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(dashboard.pulseButton).toBeVisible();
    await dashboard.sendPulse();

    // Wait for the page to refresh after pulse (server component re-renders)
    // The button text changes to "Sending..." and then the page reloads
    await page.waitForLoadState('networkidle');

    // After page refresh, pulse button should be gone
    // Use a longer timeout since router.refresh() triggers server re-render
    await expect(dashboard.pulseButton).toBeHidden({ timeout: 15_000 });

    // DB verify: pulse exists
    await verifyPulseExists(userAId);
  });

  test('already-pulsed: active status, no button', async ({ page }) => {
    await insertPulse(userAId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(dashboard.statusTitle).toBeVisible();
    await expect(dashboard.pulseButton).toBeHidden();
  });

  test('wisdom card appears when pulsed and auto-dismisses', async ({ page }) => {
    // Insert a pulse via admin so the dashboard loads with showWisdom=true on first render
    await insertPulse(userAId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    // Wisdom card has aria-label="Wisdom card - click to dismiss"
    const wisdomCard = page.locator('button[aria-label*="Wisdom"]');
    await expect(wisdomCard).toBeVisible({ timeout: 10_000 });

    // Wisdom card auto-dismisses after ~3s + animation
    await expect(wisdomCard).toBeHidden({ timeout: 10_000 });
  });

  test('streak card is visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    // Streak card shows days count
    await expect(page.getByText(/days?$/i).first()).toBeVisible();
  });

  test('seat grid with empty seats is visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    // "Your Connections" heading and "Add Connection" buttons
    await expect(page.getByText(/Your Connections/i)).toBeVisible();
    await expect(page.getByText(/Add Connection/i).first()).toBeVisible();
  });
});
