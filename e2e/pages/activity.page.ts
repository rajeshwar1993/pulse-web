import type { Locator, Page } from "@playwright/test";

export class ActivityPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly streakBadge: Locator;
  readonly ghostCalendar: Locator;
  readonly memberSince: Locator;
  readonly totalPulses: Locator;
  readonly calendarLegend: Locator;
  readonly milestoneBadges: Locator;
  readonly pulseRate: Locator;
  readonly pulseRateLabel: Locator;
  readonly milestonesTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading").first();
    this.streakBadge = page.getByText(/streak/i);
    this.ghostCalendar = page.locator(
      '[class*="calendar"], [class*="Calendar"]',
    );
    this.memberSince = page.getByText(/member since/i);
    this.totalPulses = page.getByText(/total pulses/i).first();
    this.calendarLegend = page.locator('[data-testid="calendar-legend"]');
    this.milestoneBadges = page.locator('[data-testid="milestone-badges"]');
    this.pulseRate = page.locator('[data-testid="pulse-rate"]');
    this.pulseRateLabel = page.getByText("Pulse Rate");
    this.milestonesTitle = page.getByText("Milestones");
  }

  async goto() {
    await this.page.goto("/appview/activity");
  }

  async gotoBrowser() {
    await this.page.goto("/activity");
  }
}
