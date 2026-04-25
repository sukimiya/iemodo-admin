import client from './client';

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    email: string;
    displayName: string;
    role: string;
    tenantId: string;
  };
}

export function login(params: LoginParams) {
  return client.post<LoginResult>('/uc/api/v1/auth/login', params);
}

export function logout() {
  return client.post('/uc/api/v1/auth/logout');
}
