import { test, expect } from '@playwright/test';
import { TEST_USER_A } from '../../config';
import {
  deleteUserPulses,
  getUserIdByEmail,
  getTodayPulses,
  insertPulseForUser,
} from '../../helpers/supabase-admin';

let userAId: string;

test.beforeAll(async () => {
  userAId = await getUserIdByEmail(TEST_USER_A.email);
});

test.describe('Dashboard (browser)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    await deleteUserPulses(userAId);
  });

  test('displays time-based greeting with user name', async ({ page }) => {
    await page.goto('/dashboard');

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(
      /Good (morning|afternoon|evening), Test User A!/,
    );
  });

  test('shows inactive status when not pulsed', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(
      page.getByText("You haven't pulsed yet today"),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send Pulse' }),
    ).toBeVisible();
  });

  test('sends pulse and updates status', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Send Pulse' }).click();

    // Toast appears
    await expect(page.getByText('Pulse sent!')).toBeVisible({
      timeout: 10_000,
    });

    // Status updates
    await expect(page.getByText('You are active today')).toBeVisible({
      timeout: 10_000,
    });

    // Pulse button disappears
    await expect(
      page.getByRole('button', { name: 'Send Pulse' }),
    ).not.toBeVisible();

    // DB verification
    const pulses = await getTodayPulses(userAId);
    expect(pulses.length).toBe(1);
  });

  test('hides pulse button when already pulsed', async ({ page }) => {
    await insertPulseForUser(userAId);

    await page.goto('/dashboard');

    await expect(page.getByText('You are active today')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Send Pulse' }),
    ).not.toBeVisible();
  });

  test('shows wisdom card after pulsing', async ({ page }) => {
    await insertPulseForUser(userAId);

    await page.goto('/dashboard');

    const wisdomCard = page.getByLabel(/wisdom card/i);
    await expect(wisdomCard).toBeVisible({ timeout: 5_000 });

    // Auto-dismisses after ~3s + animation
    await expect(wisdomCard).not.toBeVisible({ timeout: 6_000 });
  });

  test('settings link navigates to /settings', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: 'Settings' }).first().click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('shows empty connections state', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('No connections yet')).toBeVisible();
  });
});
