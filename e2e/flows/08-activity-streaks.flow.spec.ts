import { test, expect } from "@playwright/test";
import { TEST_USER_A } from "../config";
import { ActivityPage } from "../pages/activity.page";
import { getUserIdByEmail } from "../admin/auth";
import { insertPulseAt, deleteUserPulses } from "../admin/pulses";

test.describe("08 — Activity & Streaks Flow", () => {
  test.describe.configure({ mode: "serial" });

  let userAId: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    await deleteUserPulses(userAId);

    // Insert pulses in chronological order (oldest first) so the streak
    // trigger correctly increments total_pulse_count and current_streak.
    const now = new Date();
    for (let daysAgo = 4; daysAgo >= 0; daysAgo--) {
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      date.setHours(10, 0, 0, 0); // 10 AM each day
      await insertPulseAt(userAId, date);
    }
  });

  test.afterAll(async () => {
    await deleteUserPulses(userAId);
  });

  test("activity page renders all sections", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    await expect(activity.heading).toBeVisible();
    // Look for streak badge area
    await expect(page.getByText(/day/i).first()).toBeVisible();
    // Look for "MEMBER SINCE" label
    await expect(page.getByText(/member since/i)).toBeVisible();
    // Look for "TOTAL PULSES" label (use first() — also appears in milestone badges)
    await expect(page.getByText(/total pulses/i).first()).toBeVisible();
  });

  test("total pulses count is correct", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    // "Total Pulses" appears twice: milestone badges (1st) and stats grid (2nd).
    // Target the stats grid instance (nth(1)) to check the count.
    const totalPulsesLabel = page.getByText(/total pulses/i).nth(1);
    await expect(totalPulsesLabel).toBeVisible();
    // The count is a sibling <p> in the same card container
    const card = totalPulsesLabel.locator("..");
    await expect(card.getByText("5", { exact: true })).toBeVisible();
  });

  test("calendar legend is visible with all 4 items", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    await expect(activity.calendarLegend).toBeVisible();
    await expect(activity.calendarLegend.getByText("Pulsed")).toBeVisible();
    await expect(activity.calendarLegend.getByText("Missed")).toBeVisible();
    await expect(activity.calendarLegend.getByText("Today")).toBeVisible();
    await expect(activity.calendarLegend.getByText("Streak")).toBeVisible();
  });

  test("pulse rate card is visible", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    await expect(activity.pulseRateLabel).toBeVisible();
    await expect(activity.pulseRate).toBeVisible();
    await expect(activity.pulseRate).toHaveText(/\d+%/);
  });

  test("milestone badges section renders with correct earned state", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const activity = new ActivityPage(page);
    await activity.gotoBrowser();

    await expect(activity.milestoneBadges).toBeVisible();
    await expect(activity.milestonesTitle).toBeVisible();
    // Section labels within the milestone container
    await expect(
      activity.milestoneBadges.getByText("Total Pulses"),
    ).toBeVisible();
    await expect(
      activity.milestoneBadges.getByText("Best Streak"),
    ).toBeVisible();
    // First badge of each category renders
    await expect(
      page.locator('[data-testid="pulse-milestone-7"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="streak-milestone-7"]'),
    ).toBeVisible();
    // With 5 pulses / 5-day streak, all badges should be unearned
    // (opacity-40 is on the child IconBadge, not the container)
    await expect(
      page.locator('[data-testid="pulse-milestone-7"]').locator(".opacity-40"),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="streak-milestone-7"]').locator(".opacity-40"),
    ).toBeVisible();
  });

  test("appview activity page renders correctly", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "chromium",
      "Appview route — mobile only",
    );
    const activity = new ActivityPage(page);
    await activity.goto();

    await expect(activity.heading).toBeVisible();
    await expect(page.getByText(/day/i).first()).toBeVisible();
    await expect(page.getByText(/total pulses/i).first()).toBeVisible();
  });

  test("appview activity shows new features", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "chromium",
      "Appview route — mobile only",
    );
    const activity = new ActivityPage(page);
    await activity.goto();

    await expect(activity.calendarLegend).toBeVisible();
    await expect(activity.milestoneBadges).toBeVisible();
    await expect(activity.pulseRate).toBeVisible();
  });
});
