export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(user) {
    await this.goto();
    await this.page.locator('input[name="email"]').fill(user.email);
    await this.page.locator('input[name="password"]').fill(user.password);
    await this.page.getByRole('button', { name: /log in/i }).click();
    await this.page.waitForURL(/\/claims|\/admin\//);
  }
}
