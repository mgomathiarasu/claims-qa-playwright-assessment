export function buildValidClaim(overrides = {}) {
  const now = new Date();
  const incidentDate = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12);

  return {
    incidentDate: incidentDate.toISOString().slice(0, 10),
    incidentLocation: 'Sydney CBD',
    description: `Playwright validation claim for automation ${Date.now()}`,
    claimAmount: 1250.0,
    ...overrides,
  };
}

export function buildInvalidClaim(overrides = {}) {
  return buildValidClaim({
    claimAmount: 0,
    ...overrides,
  });
}
