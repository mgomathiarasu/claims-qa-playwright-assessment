import { test, expect } from '@playwright/test';
import { LoginPage } from '../support/page-objects/loginPage.js';
import { ClaimsPage } from '../support/page-objects/claimsPage.js';
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
    const claimsPage = new ClaimsPage(page);

    await loginPage.login(users.claimant);
    await artifacts.captureStep('after-login');

    await claimsPage.openNewClaim();
    await claimsPage.fillIncidentDate('2026-10-28');
    await claimsPage.fillIncidentLocation('Sydney CBD');
    await claimsPage.fillClaimAmount(1200);
    await artifacts.captureStep('step-1-filled');
    await claimsPage.clickNext();

    await claimsPage.fillDescription('This is a valid claim for QA automation and should be accepted by the application with enough detail.');
    await artifacts.captureStep('step-2-filled');
    await claimsPage.clickNext();

    await claimsPage.expectReviewVisible();
    await artifacts.captureStep('review-step');
    await claimsPage.clickSubmitClaim();

    await expect(page).toHaveURL(/\/claims$/);
    await claimsPage.expectStatusVisible();
    await artifacts.captureStep('after-submit');
  });

  test('claim validation rejects invalid claim values', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);
    const claimsPage = new ClaimsPage(page);

    await loginPage.login(users.claimant);
    await claimsPage.openNewClaim();

    await claimsPage.fillIncidentDate(futureDateString(1));
    await claimsPage.fillIncidentLocation('abc');
    await claimsPage.fillClaimAmount(0);
    await claimsPage.blurClaimAmount();

    await claimsPage.expectIncidentDateErrorContains(/cannot be in the future/i);
    await claimsPage.expectIncidentLocationErrorContains(/at least 5 characters/i);
    await claimsPage.expectClaimAmountErrorContains(/at least \$0\.01/i);
    await artifacts.captureScreenshot('invalid-values');
  });

  test('description length validation is enforced for claims', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);
    const claimsPage = new ClaimsPage(page);

    await loginPage.login(users.claimant);
    await claimsPage.openNewClaim();
    await claimsPage.fillIncidentDate('2026-10-28');
    await claimsPage.fillIncidentLocation('Sydney CBD');
    await claimsPage.fillClaimAmount(250);
    await claimsPage.clickNext();

    await claimsPage.fillDescription('short');
    await claimsPage.blurDescription();
    await claimsPage.expectDescriptionErrorContains(/at least 10 characters/i);

    const longText = 'A'.repeat(1001);
    await claimsPage.fillDescription(longText);
    await claimsPage.blurDescription();
    await claimsPage.expectDescriptionValue('A'.repeat(1000));
    await artifacts.captureScreenshot('description-validation');
  });

  test('claim list contains no delete action for claimant workflow', async ({ page }, testInfo) => {
    const artifacts = getArtifactsForTest(testInfo);
    const loginPage = new LoginPage(page);
    const claimsPage = new ClaimsPage(page);

    await loginPage.login(users.claimant);
    await claimsPage.goto();
    await loginPage.expectClaimsPageVisible();
    await claimsPage.expectNoDeleteAction();
    await artifacts.captureScreenshot('no-delete-control');
  });
});
