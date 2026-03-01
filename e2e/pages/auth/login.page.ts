import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#login-email");
    this.passwordInput = page.locator("#login-password");
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.getByRole("alert").first();
    this.signupLink = page.getByRole("link", { name: /sign up/i });
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot/i });
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError() {
    await expect(this.errorAlert).toBeVisible();
  }

  async expectRedirectToDashboard() {
    await this.page.waitForURL("**/dashboard", { timeout: 15_000 });
  }
}
