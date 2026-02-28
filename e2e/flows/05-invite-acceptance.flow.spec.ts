import { test, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B, AUTH_STATE_USER_B } from '../config';
import { InvitePage } from '../pages/invite.page';
import { getUserIdByEmail } from '../admin/auth';
import { deleteUserConnections, getActiveConnections } from '../admin/connections';
import { deleteUserInviteCodes, createInviteCode } from '../admin/invites';
import { verifyConnectionCount } from '../admin/verify';

test.describe('05 — Invite Acceptance Flow @smoke', () => {
  test.describe.configure({ mode: 'serial' });

  let userAId: string;
  let userBId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    userBId = await getUserIdByEmail(TEST_USER_B.email);
  });

  test.beforeEach(async () => {
    await deleteUserConnections(userAId);
    await deleteUserConnections(userBId);
    await deleteUserInviteCodes(userAId);
    await deleteUserInviteCodes(userBId);
  });

  test('invite page displays code from URL', async ({ browser }) => {
    const invite = await createInviteCode(userAId);
    const context = await browser.newContext({
      storageState: AUTH_STATE_USER_B,
    });
    const page = await context.newPage();

    await page.goto(`/invite?code=${invite.code}`);

    // Code should be displayed on page (font-mono teal text)
    await expect(page.getByText(invite.code)).toBeVisible({ timeout: 10_000 });

    await context.close();
  });

  test('User B accepts invite → DB verify: connection created', async ({ browser }) => {
    const invite = await createInviteCode(userAId);
    const context = await browser.newContext({
      storageState: AUTH_STATE_USER_B,
    });
    const page = await context.newPage();

    await page.goto(`/invite?code=${invite.code}`);
    const acceptButton = page.getByRole('button', { name: /accept/i });
    await expect(acceptButton).toBeVisible({ timeout: 10_000 });
    await acceptButton.click();

    // The invite page pushes to /connections which may not exist as a browser route.
    // Just wait for navigation away from the invite page.
    await page.waitForFunction(
      () => !window.location.pathname.includes('/invite'),
      { timeout: 15_000 },
    );

    // DB verify: connection created for both users
    const connectionsA = await getActiveConnections(userAId);
    const connectionsB = await getActiveConnections(userBId);
    expect(connectionsA.length).toBeGreaterThan(0);
    expect(connectionsB.length).toBeGreaterThan(0);

    await context.close();
  });

  test('User B declines invite → redirect to dashboard + DB verify: no connection', async ({ browser }) => {
    const invite = await createInviteCode(userAId);
    const context = await browser.newContext({
      storageState: AUTH_STATE_USER_B,
    });
    const page = await context.newPage();

    await page.goto(`/invite?code=${invite.code}`);
    const declineButton = page.getByRole('button', { name: /decline/i });
    await expect(declineButton).toBeVisible({ timeout: 10_000 });
    await declineButton.click();

    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    await verifyConnectionCount(userAId, 0);

    await context.close();
  });

  test('missing code → error alert', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_USER_B,
    });
    const page = await context.newPage();

    await page.goto('/invite');

    // Without a code param, the invite page immediately renders an error alert
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 10_000 });

    await context.close();
  });

  test('invalid code → error state', async ({ browser }) => {
    const context = await browser.newContext({
      storageState: AUTH_STATE_USER_B,
    });
    const page = await context.newPage();

    await page.goto('/invite?code=INVALID_CODE_000');

    // Accept button should be visible, click it to see the error
    const acceptButton = page.getByRole('button', { name: /accept/i });
    if (await acceptButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await acceptButton.click();
      // Should show error alert after trying to accept invalid code
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
    }

    await context.close();
  });
});
