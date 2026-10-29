import { test, expect } from '@playwright/test';

import { LoginPage } from '../support/page-objects/loginPage.js';
import { users } from '../support/fixtures/users.js';

test.describe('Authentication and route protection', () => {
  test('admin login succeeds and routes to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.admin);

    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByRole('heading', { name: /admin dashboard/i })).toBeVisible();
  });

  test('claimant login succeeds and routes to claims page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);

    await expect(page).toHaveURL(/\/claims/);
    await expect(page.getByRole('heading', { name: /my claims/i })).toBeVisible();
  });

  test('invalid login is rejected', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await page.locator('input[name="email"]').fill('wrong@example.com');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('claimant cannot access admin route', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/claims|\/login/);
  });
});
