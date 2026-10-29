import { config } from '../infrastructure/config.js';

export async function loginAs(page, user = config.users.claimant) {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(user.email);
  await page.locator('input[name="password"]').fill(user.password);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(/\/claims|\/admin\//);
  return page;
}

export async function logout(page) {
  await page.getByRole('button', { name: /logout/i }).click();
  await page.waitForURL(/\/login/);
}
