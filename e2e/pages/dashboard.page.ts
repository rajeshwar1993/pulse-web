import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly subtitle: Locator;
  readonly statusCard: Locator;
  readonly statusTitle: Locator;
  readonly settingsLink: Locator;
  readonly wisdomCard: Locator;
  readonly connectionGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('h1').first();
    this.subtitle = page.locator('h1 + p');
    this.statusCard = page.locator('text=Your Status').locator('..');
    this.statusTitle = page.getByText(/Your Status/i);
    this.settingsLink = page.getByLabel('Settings');
    this.wisdomCard = page.getByLabel(/wisdom/i);
    this.connectionGrid = page.locator('[class*="grid"]');
  }

  async goto() {
    await this.page.goto('/appview/dashboard');
  }

  async gotoWithMockData() {
    await this.page.goto('/appview/dashboard?mock=true');
  }

  async getGreetingText(): Promise<string> {
    return (await this.greeting.textContent()) || '';
  }

  async navigateToSettings() {
    await this.settingsLink.click();
  }
}
