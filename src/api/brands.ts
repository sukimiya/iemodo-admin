import client from './client';

export interface Brand {
  id: number;
  name: string;
  nameLocalized: string;
  logoUrl: string;
  website: string;
  description: string;
  countryCode: string;
  sortOrder: number;
  isActive: boolean;
}

export function getBrands() {
  return client.get('/pc/api/v1/brands');
}

export function getBrand(id: number) {
  return client.get(`/pc/api/v1/brands/${id}`);
}

export function createBrand(data: Partial<Brand>) {
  return client.post('/pc/api/v1/brands', data);
}

export function updateBrand(id: number, data: Partial<Brand>) {
  return client.put(`/pc/api/v1/brands/${id}`, data);
}

export function deleteBrand(id: number) {
  return client.delete(`/pc/api/v1/brands/${id}`);
}
