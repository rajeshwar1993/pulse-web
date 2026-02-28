import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly greeting: Locator;
  readonly subtitle: Locator;
  readonly statusCard: Locator;
  readonly statusTitle: Locator;
  readonly pulseButton: Locator;
  readonly wisdomCard: Locator;
  readonly streakCard: Locator;
  readonly seatGrid: Locator;
  readonly settingsLink: Locator;
  readonly pendingRequestsBanner: Locator;
  readonly toasts: Locator;

  constructor(page: Page) {
    this.page = page;
    this.greeting = page.locator('h1').first();
    this.subtitle = page.locator('h1 + p');
    this.statusCard = page.locator('text=Your Status').locator('..');
    this.statusTitle = page.getByText(/Your Status/i);
    this.pulseButton = page.getByRole('button', { name: /send pulse/i });
    this.wisdomCard = page.getByLabel(/wisdom/i);
    this.streakCard = page.getByText(/streak/i).first();
    this.seatGrid = page.locator('[class*="grid"]');
    this.settingsLink = page.getByRole('link', { name: /settings/i });
    this.pendingRequestsBanner = page.getByText(/pending/i);
    this.toasts = page.locator('[role="status"]');
  }

  async goto() {
    await this.page.goto('/appview/dashboard');
  }

  async gotoBrowser() {
    await this.page.goto('/dashboard');
  }

  async getGreetingText(): Promise<string> {
    return (await this.greeting.textContent()) || '';
  }

  async sendPulse() {
    await this.pulseButton.click();
  }

  async clickEmptySeat() {
    // Empty seats are buttons with "+" or "invite" text in the seat grid
    const emptySeat = this.page.getByRole('button', { name: /invite|add|\+/i }).first();
    await emptySeat.click();
  }

  async clickOccupiedSeat(name: string) {
    await this.page.getByText(name).click();
  }

  async acceptPendingRequest() {
    await this.page.getByRole('button', { name: /accept/i }).first().click();
  }

  async declinePendingRequest() {
    await this.page.getByRole('button', { name: /decline/i }).first().click();
  }

  async navigateToSettings() {
    await this.settingsLink.click();
  }
}
