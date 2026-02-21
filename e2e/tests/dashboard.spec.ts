import { test, expect } from '../fixtures/base';
import { DashboardPage } from '../pages/dashboard.page';

test.describe('Dashboard', () => {
  test('page loads and displays greeting', async ({ page, flutterBridge }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Verify the page loaded — greeting should contain a time-of-day word
    const greeting = await dashboard.getGreetingText();
    expect(greeting).toMatch(/morning|afternoon|evening/i);
  });

  test('status card is visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.statusTitle).toBeVisible();
  });

  test('sends FlutterBridge ready signal on load', async ({ page, flutterBridge }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    // Wait for the ready signal (sent after 500ms delay in DashboardContent)
    await flutterBridge.waitForMessage('ready');

    const messages = await flutterBridge.getMessages();
    const readyMsg = messages.find((m) => m.type === 'ready');
    expect(readyMsg).toBeDefined();
    expect(readyMsg).toHaveProperty('timestamp');
  });

  test('settings link navigates to settings page', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await dashboard.navigateToSettings();
    await expect(page).toHaveURL(/\/appview\/settings/);
  });

  test('shows connections when mock data is enabled', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.gotoWithMockData();

    // Mock data includes 3 connections (Mom, Dad, Sarah)
    await expect(page.getByText('Mom')).toBeVisible();
    await expect(page.getByText('Dad')).toBeVisible();
    await expect(page.getByText('Sarah')).toBeVisible();
  });
});
