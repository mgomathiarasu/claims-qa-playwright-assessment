import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/loginPage.js';
import { ClaimsPage } from '../support/page-objects/claimsPage.js';
import { AdminDashboardPage } from '../support/page-objects/adminDashboardPage.js';
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
    const claimsPage = new ClaimsPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await loginPage.login(users.claimant);
    await claimsPage.openNewClaim();
    await claimsPage.fillIncidentDate('2026-10-28');
    await claimsPage.fillIncidentLocation('Sydney CBD');
    await claimsPage.fillClaimAmount(1200);
    await artifacts.captureStep('claim-form-step-1');
    await claimsPage.clickNext();
    await claimsPage.fillDescription('Admin review status transition test for QA automation.');
    await artifacts.captureStep('claim-form-step-2');
    await claimsPage.clickNext();
    await artifacts.captureStep('claim-review-step');
    await claimsPage.clickSubmitClaim();
    await artifacts.captureStep('claim-submitted');
    await loginPage.logout();

    await loginPage.login(users.admin);
    await dashboardPage.goToClaimsList();
    await expect(page).toHaveURL(/\/admin\//);

    await dashboardPage.setStatus('UNDER_REVIEW');
    await dashboardPage.confirmStatusUpdate();
    await dashboardPage.expectStatusVisible('Under Review');
    await artifacts.captureScreenshot('admin-status-update');
  });

  test('dashboard cache controls remain usable without breaking the page', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await loginPage.login(users.admin);
    await dashboardPage.goto();
    await dashboardPage.expectLoaded();

    await dashboardPage.clickLoadFromCache();
    await dashboardPage.expectCacheBadgeVisible();
    await artifacts.captureScreenshot('dashboard-cache-load');

    await dashboardPage.clickFlushCache();
    await dashboardPage.expectLoaded();
    await artifacts.captureScreenshot('dashboard-cache-flush');
  });

  test('realtime connection status indicator is visible for authenticated users', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await loginPage.login(users.admin);
    await dashboardPage.goto();
    await dashboardPage.expectStatusIndicatorVisible();
    await dashboardPage.expectConnectionStatusPattern(/Connection status: (Live|Offline|Reconnecting\.{3})/i);
    await artifacts.captureScreenshot('realtime-status');
  });
});
