import { test, expect } from '@playwright/test';
import { TEST_USER_A } from '../config';
import { DashboardPage } from '../pages/dashboard.page';
import { getUserIdByEmail } from '../admin/auth';
import { deleteUserConnections } from '../admin/connections';
import { deleteUserInviteCodes } from '../admin/invites';

test.describe('04 — Seat Invite Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let userAId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    await deleteUserConnections(userAId);
    await deleteUserInviteCodes(userAId);
  });

  test('empty seat click opens invite modal', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    // Click "Add Connection" empty seat button
    await page.getByText(/Add Connection/i).first().click();

    // Invite modal should appear with title "Invite Connection"
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.getByText(/Invite Connection/i)).toBeVisible();
  });

  test('invite modal has email input and share button', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await page.getByText(/Add Connection/i).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Email input and send button should be visible
    await expect(modal.locator('#invite-email-input')).toBeVisible();
    await expect(modal.getByRole('button', { name: /send/i })).toBeVisible();

    // Share button should be visible
    await expect(modal.getByText(/share/i).first()).toBeVisible();
  });

  test('close invite modal', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await page.getByText(/Add Connection/i).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    // Close modal via close button (X)
    const closeButton = modal.locator('button[aria-label]').first();
    await closeButton.click();

    await expect(modal).toBeHidden();
  });
});
