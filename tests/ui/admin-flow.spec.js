import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/loginPage.js';
import { users } from '../support/fixtures/users.js';
import { setupArtifactsForTest, getArtifactsForTest, finalizeArtifactsForTest } from '../support/testArtifacts.js';

test.beforeEach(async ({ page, context }, testInfo) => {
  await setupArtifactsForTest(page, context, testInfo);
});

test.afterEach(async ({ page, context }, testInfo) => {
  await finalizeArtifactsForTest(page, context, testInfo);
});

test.describe('Admin workflow and dashboard checks', () => {
  test('admin can update a submitted claim to under review', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await page.goto('/claims/new');
    await page.locator('input#incidentDate').fill('2026-10-28');
    await page.locator('input#incidentLocation').fill('Sydney CBD');
    await page.locator('input#claimAmount').fill('1200');
    await artifacts.captureStep('claim-form-step-1');
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.locator('textarea#description').fill('Admin review status transition test for QA automation.');
    await artifacts.captureStep('claim-form-step-2');
    await page.getByRole('button', { name: /^Next$/i }).click();
    await artifacts.captureStep('claim-review-step');
    await page.getByTestId('wizard-step-3').getByRole('button', { name: /^Submit Claim$/i }).click();
    await artifacts.captureStep('claim-submitted');
    await page.getByRole('button', { name: /Logout/i }).click();

    await loginPage.login(users.admin);
    await page.goto('/admin/claims');
    await expect(page.getByRole('heading', { name: /claims/i }).first()).toBeVisible();

    const statusSelect = page.locator('select[aria-label*="Update status"]').first();
    await statusSelect.selectOption('UNDER_REVIEW');
    await page.getByRole('button', { name: /^Confirm$/i }).click();

    await expect(page.getByText('Under Review').first()).toBeVisible();
    await artifacts.captureScreenshot('admin-status-update');
  });

  test('dashboard cache controls remain usable without breaking the page', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.admin);
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible();

    await page.getByRole('button', { name: /Load dashboard stats from cache/i }).click();
    await expect(page.getByText(/^Cache Hit ⚡$|^Cache Miss$/i)).toBeVisible();
    await artifacts.captureScreenshot('dashboard-cache-load');

    await page.getByRole('button', { name: /Flush cache and reload dashboard stats from database/i }).click();
    await expect(page.getByRole('heading', { name: /Admin Dashboard/i })).toBeVisible();
    await artifacts.captureScreenshot('dashboard-cache-flush');
  });

  test('realtime connection status indicator is visible for authenticated users', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    const status = page.getByRole('status', { name: /Connection status:/i });
    await expect(status).toBeVisible();
    await expect(status).toHaveAttribute('aria-label', /Connection status: (Live|Offline|Reconnecting\.{3})/i);
    await artifacts.captureScreenshot('realtime-status');
  });
});
