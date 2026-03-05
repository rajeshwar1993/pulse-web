import { type Page, type Locator } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backLink: Locator;
  readonly languageSection: Locator;
  readonly languageRadioGroup: Locator;
  readonly profileHeading: Locator;
  readonly profileCard: Locator;
  readonly profileName: Locator;
  readonly editProfileLink: Locator;
  readonly bottomNavDashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { level: 1 });
    this.backLink = page.getByLabel(/back/i);
    this.languageSection = page.getByRole("heading", { name: /language/i });
    this.languageRadioGroup = page.getByRole("radiogroup");
    this.profileHeading = page.getByRole("heading", { name: /profile/i });
    this.profileCard = page
      .locator('[class*="card"], [class*="Card"]')
      .filter({ hasText: /profile/i });
    this.profileName = page.locator("p.truncate");
    this.editProfileLink = page.getByRole("link", { name: /edit profile/i });
    this.bottomNavDashboard = page.locator('nav a[href="/appview/dashboard"]');
  }

  async goto() {
    await this.page.goto("/appview/settings");
  }

  async gotoBrowser() {
    await this.page.goto("/settings");
  }

  /** Browser settings: click the back arrow link */
  async navigateBack() {
    await this.backLink.click();
  }

  /** Appview settings: tap dashboard in bottom nav */
  async navigateBackViaBottomNav() {
    await this.bottomNavDashboard.click();
  }

  async navigateToEditProfile() {
    await this.editProfileLink.click();
  }
}
