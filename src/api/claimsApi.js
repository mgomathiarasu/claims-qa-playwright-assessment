import { config } from '../infrastructure/config.js';

export async function createClaimViaBff(request, cookies, claimPayload) {
  const response = await request.post(`${config.bffUrl}/api/claims`, {
    headers: {
      Cookie: cookies,
      'Content-Type': 'application/json',
    },
    data: claimPayload,
    failOnStatusCode: false,
  });

  return response;
}

export async function listClaimsViaBff(request, cookies) {
  const response = await request.get(`${config.bffUrl}/api/claims`, {
    headers: { Cookie: cookies },
    failOnStatusCode: false,
  });

  return response;
}
