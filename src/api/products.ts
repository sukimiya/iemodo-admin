import client from './client';

export interface Product {
  id: number;
  productCode: string;
  spuCode: string;
  title: string;
  description: string;
  categoryId: number;
  basePrice: number;
  marketPrice: number;
  productStatus: string;
  mainImage: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  weightG: number;
  originCountry: string;
  viewCount: number;
  saleCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  parentId: number;
  name: string;
  nameLocalized: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
}

export function getProducts(params?: {
  country?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return client.get('/pc/api/v1/products', { params });
}

export function getProduct(id: number) {
  return client.get(`/pc/api/v1/products/${id}`);
}

export function searchProducts(q: string, params?: {
  country?: string;
  limit?: number;
  offset?: number;
}) {
  return client.get('/pc/api/v1/products/search', { params: { q, ...params } });
}

export function createProduct(data: Partial<Product>) {
  return client.post('/pc/api/v1/products', data);
}

export function updateProduct(id: number, data: Partial<Product>) {
  return client.put(`/pc/api/v1/products/${id}`, data);
}

export function deleteProduct(id: number) {
  return client.delete(`/pc/api/v1/products/${id}`);
}

export function getCategories() {
  return client.get('/pc/api/v1/categories');
}
