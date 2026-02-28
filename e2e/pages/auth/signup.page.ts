import { type Page, type Locator, expect } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly loginLink: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#signup-email');
    this.passwordInput = page.locator('#signup-password');
    this.confirmPasswordInput = page.locator('#signup-confirm-password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorAlert = page.getByRole('alert').first();
    this.loginLink = page.getByRole('link', { name: /log in/i });
    this.successMessage = page.getByText(/verification/i);
  }

  async goto() {
    await this.page.goto('/auth/signup');
  }

  async signup(email: string, password: string, confirmPassword?: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.submitButton.click();
  }

  async expectError() {
    await expect(this.errorAlert).toBeVisible();
  }
}
