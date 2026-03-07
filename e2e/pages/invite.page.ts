import { expect, type Locator, type Page } from "@playwright/test";

export class InvitePage {
  readonly page: Page;
  readonly codeDisplay: Locator;
  readonly acceptButton: Locator;
  readonly declineButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.codeDisplay = page.locator(
      '[class*="monospace"], [class*="font-mono"]',
    );
    this.acceptButton = page.getByRole("button", { name: /accept/i });
    this.declineButton = page.getByRole("button", { name: /decline/i });
    this.errorAlert = page.getByRole("alert");
  }

  async gotoWithCode(code: string) {
    await this.page.goto(`/invite?code=${code}`);
  }

  async accept() {
    await this.acceptButton.click();
  }

  async decline() {
    await this.declineButton.click();
  }

  async expectError() {
    await expect(this.errorAlert).toBeVisible();
  }
}
