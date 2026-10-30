import { test, expect } from '@playwright/test';
import { users } from '../support/fixtures/users.js';
import { LoginPage } from '../support/page-objects/loginPage.js';

async function loginAndReturnPage(page, user) {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.fillEmail(user.email);
  await loginPage.fillPassword(user.password);
  await loginPage.submit();
  await page.waitForURL(/\/claims|\/admin\//);
  return page;
}

test.describe('Claims API coverage', () => {
  test('claimant can fetch their own claims via API', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndReturnPage(page, users.claimant);

    const response = await page.request.get('/api/claims');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    await context.close();
  });

  test('admin dashboard stats endpoint returns data', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndReturnPage(page, users.admin);

    const response = await page.request.get('/api/admin/dashboard/stats');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('totalClaims');
    await context.close();
  });

  test('invalid API claim payload is rejected', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await loginAndReturnPage(page, users.claimant);

    const csrfResponse = await page.request.get('/api/auth/csrf');
    expect(csrfResponse.status()).toBe(200);
    const csrf = await csrfResponse.json();
    expect(csrf).toHaveProperty('token');

    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const response = await page.request.post('/api/claims', {
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': csrf.token,
      },
      data: {
        incidentDate: futureDate,
        incidentLocation: 'Sydney CBD',
        claimAmount: 1200,
        description: 'This should be rejected by the backend validation layer.',
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    await context.close();
  });
});
