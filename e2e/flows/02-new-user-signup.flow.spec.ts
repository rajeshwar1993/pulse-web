import { test, expect } from "@playwright/test";
import { TEST_USER_C } from "../config";
import { SignupPage } from "../pages/auth/signup.page";
import { LoginPage } from "../pages/auth/login.page";
import { ProfileSetupPage } from "../pages/profile-setup.page";
import {
  ensureAuthUser,
  deleteAuthUser,
  getUserIdByEmail,
} from "../admin/auth";
import { getProfile } from "../admin/profiles";

test.describe("02 — New User Signup Flow", () => {
  test.describe.configure({ mode: "serial" });

  let userCId: string;

  test.beforeAll(async () => {
    // Create USER_C via admin (auth only, NO profile, email confirmed)
    userCId = await ensureAuthUser(
      TEST_USER_C.email,
      TEST_USER_C.password,
      TEST_USER_C.displayName,
    );
  });

  test.afterAll(async () => {
    try {
      const id = await getUserIdByEmail(TEST_USER_C.email);
      await deleteAuthUser(id);
    } catch {
      // User may not exist if test failed early
    }
  });

  test("signup page renders correctly", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.goto();

    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.passwordInput).toBeVisible();
    await expect(signupPage.confirmPasswordInput).toBeVisible();
    await expect(signupPage.submitButton).toBeVisible();
    await expect(signupPage.loginLink).toBeVisible();

    await context.close();
  });

  test("password mismatch shows error", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup(
      "mismatch@test.local",
      "Password123!",
      "DifferentPass!",
    );
    await signupPage.expectError();

    await context.close();
  });

  test("short password shows error", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const signupPage = new SignupPage(page);
    await signupPage.goto();
    await signupPage.signup("short@test.local", "ab", "ab");
    await signupPage.expectError();

    await context.close();
  });

  test("User C logs in (no profile) and is redirected to profile-setup", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(TEST_USER_C.email, TEST_USER_C.password);

    // Should redirect to profile-setup since no profile exists
    await page.waitForURL("**/profile-setup", { timeout: 15_000 });
    await expect(page.locator("#display-name")).toBeVisible();

    await context.close();
  });

  test("profile setup: fill name + select avatar + save → redirect to dashboard", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER_C.email, TEST_USER_C.password);
    await page.waitForURL("**/profile-setup", { timeout: 15_000 });

    const profileSetup = new ProfileSetupPage(page);
    await profileSetup.fillDisplayName(TEST_USER_C.displayName);
    await profileSetup.selectAvatar(2);
    await profileSetup.submit();

    await page.waitForURL("**/dashboard", { timeout: 15_000 });

    await context.close();
  });

  test("DB verify: profile created with correct display_name", async () => {
    const userId = await getUserIdByEmail(TEST_USER_C.email);
    const profile = await getProfile(userId);
    expect(profile).toBeTruthy();
    expect(profile.display_name).toBe(TEST_USER_C.displayName);
    expect(profile.avatar_url).toBeTruthy();
  });
});
