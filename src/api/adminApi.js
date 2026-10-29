import { config } from '../infrastructure/config.js';

export async function getDashboardStatsViaBff(request, cookies) {
  const response = await request.get(`${config.bffUrl}/api/admin/dashboard/stats?bypassCache=false`, {
    headers: { Cookie: cookies },
    failOnStatusCode: false,
  });

  return response;
}

export async function listUsersViaBff(request, cookies) {
  const response = await request.get(`${config.bffUrl}/api/admin/users`, {
    headers: { Cookie: cookies },
    failOnStatusCode: false,
  });

  return response;
}
