import { test, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B } from '../../config';
import {
  createInviteCodeForUser,
  deleteUserConnections,
  deleteUserInviteCodes,
  getActiveConnections,
  getUserIdByEmail,
} from '../../helpers/supabase-admin';

let userAId: string;
let userBId: string;

test.beforeAll(async () => {
  userAId = await getUserIdByEmail(TEST_USER_A.email);
  userBId = await getUserIdByEmail(TEST_USER_B.email);
});

test.describe('Invite (browser)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    await deleteUserConnections(userAId);
    await deleteUserConnections(userBId);
    await deleteUserInviteCodes(userAId);
    await deleteUserInviteCodes(userBId);
  });

  test('displays invite code from URL', async ({ page }) => {
    const invite = await createInviteCodeForUser(userBId);

    await page.goto(`/invite?code=${invite.code}`);

    // Code displayed
    await expect(page.getByText(invite.code)).toBeVisible({ timeout: 10_000 });

    // Accept and Decline buttons visible
    await expect(
      page.getByRole('button', { name: 'Accept' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Decline' }),
    ).toBeVisible();
  });

  test('accepts invite and redirects', async ({ page }) => {
    const invite = await createInviteCodeForUser(userBId);

    await page.goto(`/invite?code=${invite.code}`);
    await expect(
      page.getByRole('button', { name: 'Accept' }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Accept' }).click();

    // Redirect to connections page
    await expect(page).toHaveURL(/\/connections/, { timeout: 15_000 });

    // DB verification
    const connections = await getActiveConnections(userAId);
    expect(connections.length).toBeGreaterThan(0);
  });

  test('declines invite and goes to dashboard', async ({ page }) => {
    const invite = await createInviteCodeForUser(userBId);

    await page.goto(`/invite?code=${invite.code}`);
    await expect(
      page.getByRole('button', { name: 'Decline' }),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Decline' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

    // DB verification — no connection created
    const connections = await getActiveConnections(userAId);
    expect(connections).toHaveLength(0);
  });

  test('shows error for missing code', async ({ page }) => {
    await page.goto('/invite');

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(
      page.getByText('Something went wrong'),
    ).toBeVisible();
  });
});
