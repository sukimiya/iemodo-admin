import client from './client';

export interface AdminUser {
  id: number;
  tenantId: string;
  email: string;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
}

export function getUsers(tenantId?: string) {
  const params = tenantId ? { tenantId } : {};
  return client.get('/uc/api/v1/users', { params });
}
