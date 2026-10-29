export class ClaimsPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/claims');
  }

  async expectEmptyState() {
    await this.page.getByRole('heading', { name: /no claims yet/i }).waitFor();
  }

  async submitClaim(claim) {
    await this.page.goto('/claims/new');
    await this.page.getByLabel(/incident date/i).fill(claim.incidentDate);
    await this.page.getByLabel(/incident location/i).fill(claim.incidentLocation);
    await this.page.getByLabel(/description/i).fill(claim.description);
    await this.page.getByLabel(/claim amount/i).fill(String(claim.claimAmount));
    await this.page.getByRole('button', { name: /submit claim/i }).click();
  }
}
