import client from './client';

export interface InventoryItem {
  id: number;
  skuId: number;
  warehouseId: number;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  lowStockThreshold: number;
  warehouse?: {
    id: number;
    name: string;
    countryCode: string;
  };
}

export function getLowStockItems() {
  return client.get('/inv/api/v1/inventory/low-stock');
}

export function getSkuInventory(skuId: number) {
  return client.get(`/inv/api/v1/inventory/${skuId}`);
}

export function getInventoryTransactions(skuId: number) {
  return client.get(`/inv/api/v1/inventory/${skuId}/transactions`);
}

export function inboundStock(params: {
  warehouseId: number;
  skuId: number;
  quantity: number;
  referenceNo?: string;
  reason?: string;
}) {
  return client.post('/inv/api/v1/inventory/inbound', null, { params });
}
