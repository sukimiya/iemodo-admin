import client from './client';

export interface Tenant {
  id: number;
  tenantId: string;
  tenantName: string;
  tenantCode: string;
  tenantStatus: string;
  planType: string;
  contactEmail: string;
  contactPhone: string;
}

export interface TenantSubscription {
  tenantId: string;
  planId: string;
  subscriptionStatus: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  billingCycleCount: number;
}

export function getTenants() {
  return client.get('/tenant/api/v1/tenants');
}

export function getTenant(tenantId: string) {
  return client.get(`/tenant/api/v1/tenants/${tenantId}`);
}

export function suspendTenant(tenantId: string) {
  return client.post(`/tenant/api/v1/tenants/${tenantId}/suspend`);
}

export function activateTenant(tenantId: string) {
  return client.post(`/tenant/api/v1/tenants/${tenantId}/activate`);
}

export function getSubscription(tenantId: string) {
  return client.get('/tenant/api/v1/billing/subscription', {
    headers: { 'X-TenantID': tenantId },
  });
}

export function getAllPlans() {
  return client.get('/tenant/api/v1/billing/plans');
}
