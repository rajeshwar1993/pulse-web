import { expect, test } from "@playwright/test";
import { getUserIdByEmail } from "../admin/auth";
import { getProfile, updateProfile } from "../admin/profiles";
import { verifyProfileField } from "../admin/verify";
import { TEST_USER_A } from "../config";
import { ProfileSetupPage } from "../pages/profile-setup.page";
import { SettingsPage } from "../pages/settings.page";

test.describe("07 — Profile & Settings Flow", () => {
  test.describe.configure({ mode: "serial" });

  let userAId: string;
  let originalDisplayName: string;

  test.beforeAll(async () => {
    userAId = await getUserIdByEmail(TEST_USER_A.email);
    const profile = await getProfile(userAId);
    originalDisplayName = profile.display_name;
  });

  test.afterAll(async () => {
    await updateProfile(userAId, { display_name: originalDisplayName });
  });

  test("settings page shows profile card (browser)", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await expect(settings.title).toBeVisible();
    await expect(settings.profileName).toBeVisible();
    const name = await settings.profileName.textContent();
    expect(name?.trim()).toBe(originalDisplayName);
  });

  test("language radio group with English selected", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await expect(settings.languageSection).toBeVisible();
    const englishRadio = page.getByRole("radio", { name: /english/i });
    await expect(englishRadio).toBeChecked();
  });

  test("back link navigates to /dashboard", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await settings.navigateBack();
    await page.waitForURL("**/dashboard", { timeout: 10_000 });
  });

  test("edit profile link navigates to /profile-setup?mode=edit", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const settings = new SettingsPage(page);
    await settings.gotoBrowser();

    await settings.navigateToEditProfile();
    await page.waitForURL("**/profile-setup?mode=edit", { timeout: 10_000 });
  });

  test("profile-setup prefills existing name in edit mode", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const profileSetup = new ProfileSetupPage(page);
    await profileSetup.gotoBrowser("edit");

    const value = await profileSetup.displayNameInput.inputValue();
    expect(value).toBe(originalDisplayName);
  });

  test("edit + save → redirect to /settings + DB verify: name updated", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "mobile-chrome",
      "Browser route — desktop only",
    );
    const profileSetup = new ProfileSetupPage(page);
    await profileSetup.gotoBrowser("edit");

    const newName = "Updated User A";
    await profileSetup.fillDisplayName(newName);
    await profileSetup.submit();

    await page.waitForURL("**/settings", { timeout: 15_000 });
    await verifyProfileField(userAId, "display_name", newName);

    // Restore for next tests
    await updateProfile(userAId, { display_name: originalDisplayName });
  });

  test("appview edit → redirect to /appview/settings + DB verify", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === "chromium",
      "Appview route — mobile only",
    );
    const profileSetup = new ProfileSetupPage(page);
    await profileSetup.goto("edit");

    // Wait for form to load and prefill
    await expect(profileSetup.displayNameInput).toBeVisible();
    await expect(profileSetup.displayNameInput).not.toHaveValue("");

    const newName = "AppView Updated A";
    await profileSetup.fillDisplayName(newName);

    // Wait for profile to fully load (avatar must be set for button to be enabled)
    await expect(profileSetup.saveButton).toBeEnabled({ timeout: 10_000 });

    // Submit the form programmatically to avoid the bottom nav bar overlapping the button
    await page.evaluate(() => {
      const form = document.querySelector("form");
      if (form) form.requestSubmit();
    });

    await page.waitForURL("**/appview/settings", { timeout: 15_000 });
    await verifyProfileField(userAId, "display_name", newName);

    await updateProfile(userAId, { display_name: originalDisplayName });
  });
});
