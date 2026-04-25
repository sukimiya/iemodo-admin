import client from './client';

export function getTodayOrderCount() {
  return client.get('/oc/api/v1/orders/today-count');
}

export function getUsageStatus(metric: string) {
  return client.get(`/api/v1/billing/limits/${metric}`);
}
