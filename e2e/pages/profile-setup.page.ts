import { type Page, type Locator } from '@playwright/test';

export class ProfileSetupPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly displayNameInput: Locator;
  readonly avatarGrid: Locator;
  readonly saveButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading').first();
    this.displayNameInput = page.locator('#display-name');
    this.avatarGrid = page.locator('[class*="grid"]').filter({ has: page.locator('img') });
    this.saveButton = page.locator('button[type="submit"]');
    this.errorAlert = page.getByRole('alert');
  }

  async goto(mode?: 'edit') {
    const url = mode === 'edit'
      ? '/appview/profile-setup?mode=edit'
      : '/appview/profile-setup';
    await this.page.goto(url);
  }

  async gotoBrowser(mode?: 'edit') {
    const url = mode === 'edit'
      ? '/profile-setup?mode=edit'
      : '/profile-setup';
    await this.page.goto(url);
  }

  async fillDisplayName(name: string) {
    await this.displayNameInput.clear();
    await this.displayNameInput.fill(name);
  }

  async selectAvatar(index = 0) {
    const avatarButtons = this.avatarGrid.getByRole('button');
    await avatarButtons.nth(index).click();
  }

  async submit() {
    await this.saveButton.click();
  }
}
