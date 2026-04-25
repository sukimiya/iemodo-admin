import client from './client';

export function getBillingOverview(tenantId: string) {
  return client.get('/tenant/api/v1/billing/subscription', {
    headers: { 'X-TenantID': tenantId },
  });
}

export function getAllPlans() {
  return client.get('/tenant/api/v1/billing/plans');
}

export function createCheckoutSession(tenantId: string, planId: string) {
  return client.post(
    '/tenant/api/v1/billing/checkout',
    null,
    {
      params: { planId },
      headers: { 'X-TenantID': tenantId },
    },
  );
}

export function cancelSubscription(tenantId: string) {
  return client.post('/tenant/api/v1/billing/cancel', null, {
    headers: { 'X-TenantID': tenantId },
  });
}
