import { test, expect } from '../fixtures/base';
import { TEST_USER_A } from '../config';
import {
  getProfile,
  getUserIdByEmail,
  updateProfile,
} from '../helpers/supabase-admin';
import { SettingsPage } from '../pages/settings.page';

let userAId: string;
let originalProfile: { display_name: string; avatar_url: string };

test.beforeAll(async () => {
  userAId = await getUserIdByEmail(TEST_USER_A.email);
  const profile = await getProfile(userAId);
  originalProfile = {
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
  };
});

test.afterAll(async () => {
  // Restore the original profile so other tests aren't affected
  await updateProfile(userAId, originalProfile);
});

test.describe('Profile Edit (appview)', () => {
  test.describe.configure({ mode: 'serial' });

  test('settings page shows profile card', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await expect(settings.profileHeading).toBeVisible();
    await expect(settings.profileName).toHaveText(originalProfile.display_name);
    await expect(settings.editProfileLink).toBeVisible();
  });

  test('edit link navigates to profile-setup with mode=edit', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await settings.navigateToEditProfile();

    await expect(page).toHaveURL(/\/appview\/profile-setup\?mode=edit/);
    await expect(
      page.getByRole('heading', { name: 'Edit your profile' }),
    ).toBeVisible();
  });

  test('profile-setup prefills existing data in edit mode', async ({ page }) => {
    await page.goto('/appview/profile-setup?mode=edit');

    // Wait for profile to load
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel('Display Name');
    await expect(nameInput).toHaveValue(originalProfile.display_name);
  });

  test('saving edited profile redirects to appview settings', async ({ page }) => {
    await page.goto('/appview/profile-setup?mode=edit');

    // Wait for profile to load
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10_000 });

    // Change the display name
    const nameInput = page.getByLabel('Display Name');
    await nameInput.clear();
    await nameInput.fill('AppView E2E Name');

    // Submit via keyboard — appview's fixed bottom nav overlaps the button
    await page.getByRole('button', { name: 'Save' }).focus();
    await page.keyboard.press('Enter');

    // Should redirect back to appview settings
    await expect(page).toHaveURL(/\/appview\/settings/, { timeout: 10_000 });

    // Settings should show the updated name
    await expect(page.locator('p.truncate')).toHaveText('AppView E2E Name');

    // Verify in database
    const profile = await getProfile(userAId);
    expect(profile.display_name).toBe('AppView E2E Name');
  });
});
