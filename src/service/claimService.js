export async function submitClaim(page, claimData) {
  await page.goto('/claims/new');
  await page.getByLabel(/incident date/i).fill(claimData.incidentDate);
  await page.getByLabel(/incident location/i).fill(claimData.incidentLocation);
  await page.getByLabel(/description/i).fill(claimData.description);
  await page.getByLabel(/claim amount/i).fill(String(claimData.claimAmount));
  await page.getByRole('button', { name: /submit claim/i }).click();
}
