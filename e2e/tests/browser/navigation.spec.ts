import { test, expect } from '@playwright/test';

test.describe('Navigation — Desktop', () => {
  test.describe.configure({ mode: 'serial' });

  test('nav header shows links and user menu', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for page to fully load
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Logo
    await expect(page.getByText('Pulse').first()).toBeVisible();

    // Nav links
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Dashboard' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Connections' }),
    ).toBeVisible();
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'Settings' }),
    ).toBeVisible();

    // User display name visible in header
    await expect(
      page.locator('header').getByText('Test User A'),
    ).toBeVisible();
  });

  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/dashboard');

    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Connections' })
      .click();
    await expect(page).toHaveURL(/\/connections/);

    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Settings' })
      .click();
    await expect(page).toHaveURL(/\/settings/);

    await page
      .getByRole('navigation')
      .getByRole('link', { name: 'Dashboard' })
      .click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('logo links to dashboard', async ({ page }) => {
    await page.goto('/settings');

    // Click logo link (first link with "Pulse" text)
    await page.getByRole('link', { name: 'Pulse' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('user menu opens dropdown', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Click user menu button (has aria-haspopup)
    await page.locator('button[aria-haspopup="true"]').click();

    // Dropdown appears with Settings and Log out
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Settings' })).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Log out' })).toBeVisible();
  });

  test('dropdown Settings navigates to settings', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.locator('button[aria-haspopup="true"]').click();

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    await menu.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test('active nav link is highlighted', async ({ page }) => {
    await page.goto('/dashboard');

    const dashboardLink = page
      .getByRole('navigation')
      .getByRole('link', { name: 'Dashboard' });

    // Active link has teal background styling
    await expect(dashboardLink).toHaveClass(/teal-50/);
  });
});

test.describe('Navigation — Mobile', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 375, height: 812 } });

  test('shows hamburger menu on mobile', async ({ page }) => {
    await page.goto('/dashboard');

    // Hamburger button visible
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

    // Desktop nav links hidden
    await expect(page.getByRole('navigation')).not.toBeVisible();
  });

  test('mobile menu opens with links and logout', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Menu' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Nav links inside mobile menu
    await expect(dialog.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(
      dialog.getByRole('link', { name: 'Connections' }),
    ).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Settings' })).toBeVisible();

    // Log out button
    await expect(dialog.getByText('Log out')).toBeVisible();
  });

  test('close button closes mobile menu', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Menu' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('mobile menu link navigates and closes', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Menu' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('link', { name: 'Connections' }).click();

    await expect(page).toHaveURL(/\/connections/);
    await expect(dialog).not.toBeVisible();
  });
});
