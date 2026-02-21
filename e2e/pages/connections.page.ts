import { type Page, type Locator } from '@playwright/test';

export class ConnectionsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly addConnectionButton: Locator;
  readonly connectionGrid: Locator;
  readonly emptyView: Locator;
  readonly inviteModal: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { level: 1 });
    this.addConnectionButton = page.getByRole('button', { name: /add/i });
    this.connectionGrid = page.locator('[class*="grid"]');
    this.emptyView = page.getByText(/no connections/i);
    this.inviteModal = page.locator('[class*="fixed"]');
    this.loadingSpinner = page.locator('.animate-spin');
  }

  async goto() {
    await this.page.goto('/appview/connections');
  }

  async waitForLoaded() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10_000 });
  }
}
