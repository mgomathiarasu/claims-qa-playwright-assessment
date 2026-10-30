import { getSelector } from '../locatorFactory.js';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  locator(key) {
    return this.page.locator(getSelector('login', key));
  }

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email) {
    await this.locator('emailInput').fill(email);
  }

  async fillPassword(password) {
    await this.locator('passwordInput').fill(password);
  }

  async submit() {
    await this.locator('submitButton').click();
  }

  async logout() {
    await this.page.locator(getSelector('login', 'logoutButton')).click();
  }

  async login(user) {
    await this.goto();
    await this.fillEmail(user.email);
    await this.fillPassword(user.password);
    await this.submit();
    await this.page.waitForURL(/\/claims|\/admin\//);
  }

  async expectAdminDashboardVisible() {
    await this.page.locator(getSelector('login', 'adminDashboardHeading')).waitFor();
  }

  async expectClaimsPageVisible() {
    await this.page.locator(getSelector('login', 'claimsPageHeading')).waitFor();
  }

  async expectOnLoginPage() {
    await this.page.waitForURL(/\/login/);
  }
}
