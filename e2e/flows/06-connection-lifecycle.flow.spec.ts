import { test, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B } from '../config';
import { DashboardPage } from '../pages/dashboard.page';
import { getUserIdByEmail } from '../admin/auth';
import {
  createConnection,
  deleteUserConnections,
  getActiveConnections,
} from '../admin/connections';
import { verifyConnectionCount } from '../admin/verify';
import { getAdmin } from '../admin/client';

/**
 * Create a connection AND a seat so the connection appears in the seat grid.
 * The seat grid reads from connection_seats, not connections directly.
 */
async function setupConnectionWithSeat(userAId: string, userBId: string) {
  await createConnection(userAId, userBId);

  // Get the connection ID
  const connections = await getActiveConnections(userAId);
  const conn = connections[0];
  if (!conn) throw new Error('Connection not created');

  // Create a seat for this connection
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await getAdmin().from('connection_seats').insert({
    owner_id: userAId,
    seat_number: 1,
    connection_id: conn.id,
    expires_at: expiresAt.toISOString(),
  });
}

async function cleanupSeatsAndConnections(userId: string) {
  await getAdmin()
    .from('connection_seats')
    .delete()
    .eq('owner_id', userId);
  await deleteUserConnections(userId);
}

test.describe('06 — Connection Lifecycle Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let userAId: string;
  let userBId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    userBId = await getUserIdByEmail(TEST_USER_B.email);
  });

  test('occupied seat shows connection name', async ({ page }) => {
    await cleanupSeatsAndConnections(userAId);
    await setupConnectionWithSeat(userAId, userBId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    // Connection name should be visible in the seat grid
    await expect(page.getByText(TEST_USER_B.displayName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('click occupied seat → remove confirmation modal', async ({ page }) => {
    await cleanupSeatsAndConnections(userAId);
    await setupConnectionWithSeat(userAId, userBId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(page.getByText(TEST_USER_B.displayName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByText(TEST_USER_B.displayName, { exact: true }).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });
  });

  test('cancel removal → connection preserved + DB verify', async ({ page }) => {
    await cleanupSeatsAndConnections(userAId);
    await setupConnectionWithSeat(userAId, userBId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(page.getByText(TEST_USER_B.displayName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByText(TEST_USER_B.displayName, { exact: true }).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const cancelButton = modal.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    await expect(modal).toBeHidden();
    await verifyConnectionCount(userAId, 1);
  });

  test('confirm removal → seat becomes empty + DB verify', async ({ page }) => {
    await cleanupSeatsAndConnections(userAId);
    await setupConnectionWithSeat(userAId, userBId);

    const dashboard = new DashboardPage(page);
    await dashboard.gotoBrowser();

    await expect(page.getByText(TEST_USER_B.displayName, { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    await page.getByText(TEST_USER_B.displayName, { exact: true }).first().click();

    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible({ timeout: 5_000 });

    const removeButton = modal.getByRole('button', { name: /remove|delete/i });
    await removeButton.click();

    // Connection name should disappear
    await expect(page.getByText(TEST_USER_B.displayName, { exact: true }).first()).toBeHidden({ timeout: 10_000 });

    // DB verify: connection gone
    await verifyConnectionCount(userAId, 0);
  });
});
