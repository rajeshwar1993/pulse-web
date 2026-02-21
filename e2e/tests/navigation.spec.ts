import { test, expect } from '../fixtures/base';
import { DashboardPage } from '../pages/dashboard.page';
import { SettingsPage } from '../pages/settings.page';
import { ConnectionsPage } from '../pages/connections.page';

test.describe('Navigation', () => {
  test('navigate from dashboard to settings and back', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const settings = new SettingsPage(page);

    await dashboard.goto();
    await dashboard.navigateToSettings();

    await expect(page).toHaveURL(/\/appview\/settings/);
    await expect(settings.title).toBeVisible();

    await settings.navigateBack();
    await expect(page).toHaveURL(/\/appview\/dashboard/);
  });

  test('navigate directly to connections page', async ({ page }) => {
    const connections = new ConnectionsPage(page);
    await connections.goto();

    await expect(page).toHaveURL(/\/appview\/connections/);
    await expect(connections.title).toBeVisible();
  });

  test('navigate directly to settings page', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await expect(page).toHaveURL(/\/appview\/settings/);
    await expect(settings.languageSection).toBeVisible();
  });
});
