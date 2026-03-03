import { test, expect } from "../fixtures/base";
import { DashboardPage } from "../pages/dashboard.page";
import { SettingsPage } from "../pages/settings.page";

test.describe("10 — AppView Flow", () => {
  test.describe.configure({ mode: "serial" });

  test("dashboard sends FlutterBridge ready signal", async ({
    page,
    flutterBridge,
  }) => {
    await page.goto("/appview/dashboard");
    await expect(page.locator("h1").first()).toBeVisible();

    const msg = await flutterBridge.waitForMessage("ready", 10_000);
    expect(msg).toBeTruthy();
  });

  test("locale change via bridge → localStorage updated", async ({
    page,
    flutterBridge,
  }) => {
    await page.goto("/appview/dashboard");
    await expect(page.locator("h1").first()).toBeVisible();

    // Only "en" is currently in supportedLocales, so unsupported locales are ignored.
    // Clear localStorage first, then verify the bridge event sets it.
    await page.evaluate(() => localStorage.removeItem("pulse-locale"));

    await flutterBridge.sendLocaleChanged("en");

    // Wait for localStorage to be set via the FlutterBridgeListener → LocaleService
    await page.waitForFunction(
      () => localStorage.getItem("pulse-locale") === "en",
      { timeout: 10_000 },
    );

    const locale = await page.evaluate(() =>
      localStorage.getItem("pulse-locale"),
    );
    expect(locale).toBe("en");
  });

  test("navigation: dashboard → settings → dashboard via bottom nav", async ({
    page,
    flutterBridge,
  }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();

    await expect(dashboard.greeting).toBeVisible();
    await dashboard.navigateToSettings();

    await page.waitForURL("**/appview/settings", { timeout: 10_000 });
    const settings = new SettingsPage(page);
    await expect(settings.title).toBeVisible();

    await settings.navigateBackViaBottomNav();
    await page.waitForURL("**/appview/dashboard", { timeout: 10_000 });
  });

  test("settings shows profile card + edit link", async ({
    page,
    flutterBridge,
  }) => {
    const settings = new SettingsPage(page);
    await settings.goto();

    await expect(settings.title).toBeVisible();
    await expect(settings.profileName).toBeVisible();
    await expect(settings.editProfileLink).toBeVisible();
  });
});
