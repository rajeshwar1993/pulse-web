import { test, expect } from '@playwright/test';
import { TEST_USER_A } from '../config';
import { ActivityPage } from '../pages/activity.page';
import { getUserIdByEmail } from '../admin/auth';
import { insertPulseAt, deleteUserPulses } from '../admin/pulses';

test.describe('08 — Activity & Streaks Flow', () => {
  test.describe.configure({ mode: 'serial' });

  let userAId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    await deleteUserPulses(userAId);

    // Insert pulses across multiple days to build a streak
    const now = new Date();
    for (let daysAgo = 0; daysAgo < 5; daysAgo++) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(10, 0, 0, 0); // 10 AM each day
      await insertPulseAt(userAId, date);
    }
  });

  test.afterAll(async () => {
    await deleteUserPulses(userAId);
  });

  test('activity page renders all sections', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Browser route — desktop only');
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    await expect(activity.heading).toBeVisible();
    // Look for streak badge area
    await expect(page.getByText(/day/i).first()).toBeVisible();
    // Look for "MEMBER SINCE" label
    await expect(page.getByText(/member since/i)).toBeVisible();
    // Look for "TOTAL PULSES" label
    await expect(page.getByText(/total pulses/i)).toBeVisible();
  });

  test('total pulses count is correct', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile-chrome', 'Browser route — desktop only');
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    // The "Total Pulses" label (visually uppercase via CSS) and "5" count are siblings in a card.
    // Find the parent element containing the label, then check for the count nearby.
    const totalPulsesLabel = page.getByText(/total pulses/i);
    await expect(totalPulsesLabel).toBeVisible();
    // The count is a sibling <p> in the same card container
    const card = totalPulsesLabel.locator('..');
    await expect(card.getByText('5')).toBeVisible();
  });

  test('appview activity page renders correctly', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'chromium', 'Appview route — mobile only');
    const activity = new ActivityPage(page);
    await activity.goto();

    await expect(activity.heading).toBeVisible();
    await expect(page.getByText(/day/i).first()).toBeVisible();
    await expect(page.getByText(/total pulses/i)).toBeVisible();
  });
});
