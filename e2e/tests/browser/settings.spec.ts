import { test, expect } from '@playwright/test';

test.describe('Settings (browser)', () => {
  test('displays settings page layout', async ({ page }) => {
    await page.goto('/settings');

    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Language' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to Dashboard' }),
    ).toBeVisible();
  });

  test('shows language radio group with English selected', async ({ page }) => {
    await page.goto('/settings');

    const radioGroup = page.getByRole('radiogroup', { name: 'Language' });
    await expect(radioGroup).toBeVisible();

    const englishRadio = radioGroup.getByRole('radio', { name: 'English' });
    await expect(englishRadio).toHaveAttribute('aria-checked', 'true');
  });

  test('back link navigates to dashboard', async ({ page }) => {
    await page.goto('/settings');

    await page.getByRole('link', { name: 'Back to Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
