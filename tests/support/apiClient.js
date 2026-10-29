export class ApiClient {
  constructor(request, baseUrl) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  async login(user) {
    const response = await this.request.post(`${this.baseUrl}/api/auth/login`, {
      data: { email: user.email, password: user.password },
      failOnStatusCode: false,
    });

    return response;
  }

  async get(path, cookies) {
    return this.request.get(`${this.baseUrl}${path}`, {
      headers: { Cookie: cookies },
      failOnStatusCode: false,
    });
  }

  async post(path, cookies, payload) {
    return this.request.post(`${this.baseUrl}${path}`, {
      headers: {
        Cookie: cookies,
        'Content-Type': 'application/json',
      },
      data: payload,
      failOnStatusCode: false,
    });
  }
}
