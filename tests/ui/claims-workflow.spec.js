import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/loginPage.js';
import { users } from '../support/fixtures/users.js';
import { setupArtifactsForTest, getArtifactsForTest, finalizeArtifactsForTest } from '../support/testArtifacts.js';

function futureDateString(daysAhead = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

test.beforeEach(async ({ page, context }, testInfo) => {
  await setupArtifactsForTest(page, context, testInfo);
});

test.afterEach(async ({ page, context }, testInfo) => {
  await finalizeArtifactsForTest(page, context, testInfo);
});

test.describe('Claim creation and validation', () => {
  test('claimant submits a valid claim through the wizard', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await artifacts.captureStep('after-login');

    await page.goto('/claims/new');
    await page.locator('input#incidentDate').fill('2026-10-28');
    await page.locator('input#incidentLocation').fill('Sydney CBD');
    await page.locator('input#claimAmount').fill('1200');
    await artifacts.captureStep('step-1-filled');
    await page.getByRole('button', { name: /^Next$/i }).click();

    await page.locator('textarea#description').fill('This is a valid claim for QA automation and should be accepted by the application with enough detail.');
    await artifacts.captureStep('step-2-filled');
    await page.getByRole('button', { name: /^Next$/i }).click();

    await expect(page.getByRole('heading', { name: /Review Your Claim/i })).toBeVisible();
    await artifacts.captureStep('review-step');
    await page.getByTestId('wizard-step-3').getByRole('button', { name: /^Submit Claim$/i }).click();

    await expect(page).toHaveURL(/\/claims$/);
    await expect(page.getByText(/Submitted|Under Review|Approved|Rejected|Closed/i).first()).toBeVisible();
    await artifacts.captureStep('after-submit');
  });

  test('claim validation rejects invalid claim values', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await page.goto('/claims/new');

    await page.locator('input#incidentDate').fill(futureDateString(1));
    await page.locator('input#incidentLocation').fill('abc');
    await page.locator('input#claimAmount').fill('0');
    await page.locator('input#claimAmount').blur();

    await expect(page.locator('#incidentDate-error')).toContainText(/cannot be in the future/i);
    await expect(page.locator('#incidentLocation-error')).toContainText(/at least 5 characters/i);
    await expect(page.locator('#claimAmount-error')).toContainText(/at least \$0\.01/i);
    await artifacts.captureScreenshot('invalid-values');
  });

  test('description length validation is enforced for claims', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await page.goto('/claims/new');
    await page.locator('input#incidentDate').fill('2026-10-28');
    await page.locator('input#incidentLocation').fill('Sydney CBD');
    await page.locator('input#claimAmount').fill('250');
    await page.getByRole('button', { name: /^Next$/i }).click();

    await page.locator('textarea#description').fill('short');
    await page.locator('textarea#description').blur();
    await expect(page.locator('#description-error')).toContainText(/at least 10 characters/i);

    const longText = 'A'.repeat(1001);
    await page.locator('textarea#description').fill(longText);
    await page.locator('textarea#description').blur();
    await expect(page.locator('textarea#description')).toHaveValue('A'.repeat(1000));
    await artifacts.captureScreenshot('description-validation');
  });

  test('claim list contains no delete action for claimant workflow', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);

    await loginPage.login(users.claimant);
    await page.goto('/claims');
    await expect(page.getByRole('heading', { name: /My Claims/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete/i })).toHaveCount(0);
    await artifacts.captureScreenshot('no-delete-control');
  });
});
