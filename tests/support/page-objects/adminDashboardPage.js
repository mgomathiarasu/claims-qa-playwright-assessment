export class AdminDashboardPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/admin/dashboard');
  }

  async expectLoaded() {
    await this.page.getByRole('heading', { name: /admin dashboard/i }).waitFor();
  }
}
