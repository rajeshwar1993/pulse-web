import { expect, type Locator, type Page } from "@playwright/test";

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#forgot-email");
    this.submitButton = page.locator('button[type="submit"]');
    this.successMessage = page.getByText(/check your email/i);
    this.backToLoginLink = page.getByRole("link", {
      name: /back to login|login/i,
    });
  }

  async goto() {
    await this.page.goto("/auth/forgot-password");
  }

  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible({ timeout: 15_000 });
  }
}
