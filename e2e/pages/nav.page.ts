import type { Locator, Page } from "@playwright/test";

export class NavPage {
  readonly page: Page;
  readonly logo: Locator;
  readonly navLinks: Locator;
  readonly userMenuButton: Locator;
  readonly mobileMenuButton: Locator;
  readonly mobileMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByRole("link", { name: /pulse/i }).first();
    this.navLinks = page.getByRole("navigation").getByRole("link");
    this.userMenuButton = page.getByRole("button", {
      name: /user menu|account/i,
    });
    this.mobileMenuButton = page.getByLabel(/menu/i);
    this.mobileMenu = page.getByRole("dialog");
  }

  async openUserMenu() {
    await this.userMenuButton.click();
  }

  async openMobileMenu() {
    await this.mobileMenuButton.click();
  }

  async closeMobileMenu() {
    const closeButton = this.mobileMenu.getByRole("button", { name: /close/i });
    await closeButton.click();
  }
}
