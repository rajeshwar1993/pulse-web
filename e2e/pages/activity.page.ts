import { type Page, type Locator } from "@playwright/test";

export class ActivityPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly streakBadge: Locator;
  readonly ghostCalendar: Locator;
  readonly memberSince: Locator;
  readonly totalPulses: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading").first();
    this.streakBadge = page.getByText(/streak/i);
    this.ghostCalendar = page.locator(
      '[class*="calendar"], [class*="Calendar"]',
    );
    this.memberSince = page.getByText(/member since/i);
    this.totalPulses = page.getByText(/total pulses/i);
  }

  async goto() {
    await this.page.goto("/appview/activity");
  }

  async gotoBrowser() {
    await this.page.goto("/activity");
  }
}
