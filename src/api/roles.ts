import client from './client';

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
  action: string;
}

export interface Role {
  role: string;
  name: string;
  description: string;
}

export function getPermissions() {
  return client.get('/uc/api/v1/admin/permissions');
}

export function getMyPermissions() {
  return client.get('/uc/api/v1/admin/permissions/my');
}

export function getRoles() {
  return client.get('/uc/api/v1/admin/roles');
}

export function getRolePermissions(role: string) {
  return client.get(`/uc/api/v1/admin/roles/${role}/permissions`);
}

export function updateRolePermissions(role: string, permissionIds: number[]) {
  return client.put(`/uc/api/v1/admin/roles/${role}/permissions`, permissionIds);
}

export function updateUserRole(userId: number, role: string) {
  return client.put(`/uc/api/v1/admin/users/${userId}/role`, { role });
}
