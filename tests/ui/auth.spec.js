import { test, expect } from '@playwright/test';

import { LoginPage } from '../support/page-objects/loginPage.js';
import { AdminDashboardPage } from '../support/page-objects/adminDashboardPage.js';
import { users } from '../support/fixtures/users.js';

test.describe('Authentication and route protection', () => {
  test('admin login succeeds and routes to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.admin);

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await loginPage.expectAdminDashboardVisible();
  });

  test('claimant login succeeds and routes to claims page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);

    await expect(page).toHaveURL(/\/claims/);
    await loginPage.expectClaimsPageVisible();
  });

  test('invalid login is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.fillEmail('wrong@example.com');
    await loginPage.fillPassword('wrongpassword');
    await loginPage.submit();

    await loginPage.expectOnLoginPage();
  });

  test('claimant cannot access admin route', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await loginPage.login(users.claimant);
    await dashboardPage.goto();

    await expect(page).toHaveURL(/\/claims|\/login/);
  });
});
