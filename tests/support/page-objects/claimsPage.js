import { expect } from '@playwright/test';
import { getSelector } from '../locatorFactory.js';

export class ClaimsPage {
  constructor(page) {
    this.page = page;
  }

  locator(key) {
    return this.page.locator(getSelector('claims', key));
  }

  async goto() {
    await this.page.goto('/claims');
  }

  async openNewClaim() {
    await this.page.goto('/claims/new');
  }

  async fillIncidentDate(date) {
    await this.locator('incidentDateInput').fill(date);
  }

  async fillIncidentLocation(location) {
    await this.locator('incidentLocationInput').fill(location);
  }

  async fillClaimAmount(amount) {
    await this.locator('claimAmountInput').fill(String(amount));
  }

  async clickNext() {
    await this.locator('nextButton').click();
  }

  async blurClaimAmount() {
    await this.locator('claimAmountInput').blur();
  }

  async blurDescription() {
    await this.locator('descriptionInput').blur();
  }

  async fillDescription(description) {
    await this.locator('descriptionInput').fill(description);
  }

  async expectDescriptionValue(value) {
    await expect(this.locator('descriptionInput')).toHaveValue(value);
  }

  async clickSubmitClaim() {
    await this.locator('submitClaimButton').click();
  }

  async submitClaim(claim) {
    await this.openNewClaim();
    await this.fillIncidentDate(claim.incidentDate);
    await this.fillIncidentLocation(claim.incidentLocation);
    await this.fillClaimAmount(claim.claimAmount);
    await this.clickNext();
    await this.fillDescription(claim.description);
    await this.clickNext();
    await this.clickSubmitClaim();
  }

  async expectEmptyState() {
    await this.page.locator(getSelector('claims', 'claimsListHeading')).waitFor();
  }

  async expectReviewVisible() {
    await expect(this.page.locator(getSelector('claims', 'reviewHeading'))).toBeVisible();
  }

  async expectStatusVisible() {
    await expect(this.page.locator(getSelector('claims', 'statusBadge')).first()).toBeVisible();
  }

  async expectNoDeleteAction() {
    await expect(this.page.locator(getSelector('claims', 'noDeleteButton'))).toHaveCount(0);
  }

  async expectIncidentDateErrorContains(message) {
    await expect(this.page.locator(getSelector('claims', 'incidentDateError'))).toContainText(message);
  }

  async expectIncidentLocationErrorContains(message) {
    await expect(this.page.locator(getSelector('claims', 'incidentLocationError'))).toContainText(message);
  }

  async expectClaimAmountErrorContains(message) {
    await expect(this.page.locator(getSelector('claims', 'claimAmountError'))).toContainText(message);
  }

  async expectDescriptionErrorContains(message) {
    await expect(this.page.locator(getSelector('claims', 'descriptionError'))).toContainText(message);
  }
}
