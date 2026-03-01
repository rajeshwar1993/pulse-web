import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/auth/login.page";
import { ForgotPasswordPage } from "../pages/auth/forgot-password.page";

test.describe("11 — Error States Flow", () => {
  test.describe.configure({ mode: "serial" });

  test("login with non-existent user shows error", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("ghost@nonexistent.local", "NoSuchPass123!");
    await loginPage.expectError();

    await context.close();
  });

  test("unauthenticated user → /dashboard redirects to /auth/login", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto("/dashboard");
    // Should redirect to login or root page
    await page.waitForURL("**/auth/login**", { timeout: 15_000 });

    await context.close();
  });

  test("forgot password page submits successfully", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();
    const forgotPage = new ForgotPasswordPage(page);

    await forgotPage.goto();
    await forgotPage.submitEmail("test@example.com");
    await forgotPage.expectSuccess();

    await context.close();
  });

  test("auth error page renders", async ({ browser }) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const page = await context.newPage();

    await page.goto("/auth/error");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /try again|login/i }),
    ).toBeVisible();

    await context.close();
  });
});
