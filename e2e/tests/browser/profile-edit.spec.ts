import { test, expect } from '@playwright/test';
import { TEST_USER_A } from '../../config';
import {
  getProfile,
  getUserIdByEmail,
  updateProfile,
} from '../../helpers/supabase-admin';
import { SettingsPage } from '../../pages/settings.page';

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

test.describe('Profile Edit (browser)', () => {
  test.describe.configure({ mode: 'serial' });

  test('settings page shows profile card with name and avatar', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await expect(settings.profileHeading).toBeVisible();
    await expect(settings.profileName).toHaveText(originalProfile.display_name);
    await expect(settings.editProfileLink).toBeVisible();
  });

  test('edit link navigates to profile-setup in edit mode', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await settings.navigateToEditProfile();

    await expect(page).toHaveURL(/\/profile-setup\?mode=edit/);
    await expect(
      page.getByRole('heading', { name: 'Edit your profile' }),
    ).toBeVisible();
  });

  test('profile-setup prefills existing name in edit mode', async ({ page }) => {
    await page.goto('/profile-setup?mode=edit');

    // Wait for profile to load (loading state disappears)
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10_000 });

    const nameInput = page.getByLabel('Display Name');
    await expect(nameInput).toHaveValue(originalProfile.display_name);
  });

  test('editing name and saving redirects to settings with updated profile', async ({ page }) => {
    await page.goto('/profile-setup?mode=edit');

    // Wait for profile to load
    await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 10_000 });

    // Change the display name
    const nameInput = page.getByLabel('Display Name');
    await nameInput.clear();
    await nameInput.fill('Updated E2E Name');

    // Click Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Should redirect back to settings
    await expect(page).toHaveURL(/\/settings/, { timeout: 10_000 });

    // Settings should show the updated name
    await expect(page.locator('p.truncate')).toHaveText('Updated E2E Name');

    // Verify in database
    const profile = await getProfile(userAId);
    expect(profile.display_name).toBe('Updated E2E Name');
  });
});
