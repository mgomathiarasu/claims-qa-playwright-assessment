import { config } from '../infrastructure/config.js';

export async function loginViaBff(request, user = config.users.claimant) {
  const response = await request.post(`${config.bffUrl}/api/auth/login`, {
    data: {
      email: user.email,
      password: user.password,
    },
    failOnStatusCode: false,
  });

  return response;
}

export async function refreshViaBff(request, cookies) {
  const response = await request.post(`${config.bffUrl}/api/auth/refresh`, {
    headers: {
      Cookie: cookies,
    },
    failOnStatusCode: false,
  });

  return response;
}
