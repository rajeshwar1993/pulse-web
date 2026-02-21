import { type Page, type Locator } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backLink: Locator;
  readonly languageSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { level: 1 });
    this.backLink = page.getByLabel(/back/i);
    this.languageSection = page.getByRole('heading', { name: /language/i });
  }

  async goto() {
    await this.page.goto('/appview/settings');
  }

  async navigateBack() {
    await this.backLink.click();
  }
}
