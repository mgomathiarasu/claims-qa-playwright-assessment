import { expect } from '@playwright/test';
import { getSelector } from '../locatorFactory.js';

export class AdminDashboardPage {
  constructor(page) {
    this.page = page;
  }

  locator(key) {
    return this.page.locator(getSelector('adminDashboard', key));
  }

  async goto() {
    await this.page.goto('/admin/dashboard');
  }

  async goToClaimsList() {
    await this.page.goto('/admin/claims');
  }

  async expectLoaded() {
    await this.locator('dashboardHeading').waitFor();
  }

  async clickLoadFromCache() {
    await this.locator('cacheLoadButton').click();
  }

  async clickFlushCache() {
    await this.locator('cacheFlushButton').click();
  }

  async expectCacheBadgeVisible() {
    await this.page.locator(getSelector('adminDashboard', 'cacheBadge')).first().waitFor();
  }

  async expectStatusIndicatorVisible() {
    await this.locator('statusIndicator').waitFor();
  }

  async expectConnectionStatusPattern(pattern) {
    await expect(this.locator('statusIndicator')).toHaveAttribute('aria-label', pattern);
  }

  async setStatus(statusValue) {
    await this.page.locator(getSelector('adminDashboard', 'statusSelect')).first().selectOption(statusValue);
  }

  async confirmStatusUpdate() {
    await this.page.locator(getSelector('adminDashboard', 'confirmStatusButton')).click();
  }

  async expectStatusVisible(statusText) {
    const selector = getSelector('adminDashboard', 'statusTextValue').replace('{statusText}', statusText);
    await this.page.locator(selector).first().waitFor();
  }
}
