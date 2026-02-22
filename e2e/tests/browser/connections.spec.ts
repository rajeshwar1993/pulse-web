import { test, expect } from '@playwright/test';
import { TEST_USER_A, TEST_USER_B } from '../../config';
import {
  createConnectionBetween,
  deleteUserConnections,
  deleteUserInviteCodes,
  getActiveConnections,
  getInviteCodes,
  getUserIdByEmail,
} from '../../helpers/supabase-admin';

let userAId: string;
let userBId: string;

test.beforeAll(async () => {
  userAId = await getUserIdByEmail(TEST_USER_A.email);
  userBId = await getUserIdByEmail(TEST_USER_B.email);
});

test.describe('Connections (browser)', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async () => {
    await deleteUserConnections(userAId);
    await deleteUserConnections(userBId);
    await deleteUserInviteCodes(userAId);
    await deleteUserInviteCodes(userBId);
  });

  test('shows empty state when no connections', async ({ page }) => {
    await page.goto('/connections');

    await expect(
      page.getByRole('heading', { name: 'Connections', level: 1 }),
    ).toBeVisible();
    await expect(page.getByText('0 connections')).toBeVisible();
    await expect(page.getByText('No connections yet')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Add Connection/i }).first(),
    ).toBeVisible();
  });

  test('shows connection list when connections exist', async ({ page }) => {
    await createConnectionBetween(userAId, userBId);

    await page.goto('/connections');

    await expect(page.getByText('1 connection', { exact: true })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('Test User B')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Remove Connection' }),
    ).toBeVisible();
  });

  test('opens invite modal and generates code', async ({ page }) => {
    await page.goto('/connections');

    await page.getByRole('button', { name: /Add Connection/i }).first().click();

    // Modal appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole('heading', { name: 'Invite Connection' }),
    ).toBeVisible();

    // Wait for code generation (loading spinner disappears)
    const codeInput = page.locator('#invite-code-input');
    await expect(codeInput).toBeVisible({ timeout: 10_000 });

    // Verify code format
    const codeValue = await codeInput.inputValue();
    expect(codeValue).toMatch(/^[A-Za-z2-9]{8}$/);

    // Share button visible
    await expect(
      dialog.getByRole('button', { name: 'Share Invite' }),
    ).toBeVisible();

    // DB verification (React StrictMode may double-fire useEffect)
    const codes = await getInviteCodes(userAId);
    expect(codes.length).toBeGreaterThanOrEqual(1);
  });

  test('closes invite modal', async ({ page }) => {
    await page.goto('/connections');

    await page.getByRole('button', { name: /Add Connection/i }).first().click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Close').click();
    await expect(dialog).not.toBeVisible();
  });

  test('removes connection with confirmation', async ({ page }) => {
    await createConnectionBetween(userAId, userBId);

    await page.goto('/connections');
    await expect(page.getByText('Test User B')).toBeVisible({ timeout: 10_000 });

    // Click remove on the card
    await page.getByRole('button', { name: 'Remove Connection' }).click();

    // Confirm modal appears
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('Remove this connection?'),
    ).toBeVisible();

    // Click confirm button (inside dialog to disambiguate)
    await dialog.getByRole('button', { name: 'Remove Connection' }).click();

    // Connection removed — empty state shown
    await expect(page.getByText('No connections yet')).toBeVisible({
      timeout: 10_000,
    });

    // DB verification
    const connections = await getActiveConnections(userAId);
    expect(connections).toHaveLength(0);
  });

  test('cancels connection removal', async ({ page }) => {
    await createConnectionBetween(userAId, userBId);

    await page.goto('/connections');
    await expect(page.getByText('Test User B')).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: 'Remove Connection' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();

    // Connection still visible
    await expect(page.getByText('Test User B')).toBeVisible();
  });
});
