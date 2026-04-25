import client from './client';

export interface Category {
  id: number;
  parentId: number | null;
  name: string;
  nameLocalized: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
}

export function getCategories() {
  return client.get('/pc/api/v1/categories');
}

export function getCategoryTree() {
  return client.get('/pc/api/v1/categories/tree');
}

export function getCategory(id: number) {
  return client.get(`/pc/api/v1/categories/${id}`);
}

export function getChildCategories(id: number) {
  return client.get(`/pc/api/v1/categories/${id}/children`);
}

export function createCategory(data: Partial<Category>) {
  return client.post('/pc/api/v1/categories', data);
}

export function updateCategory(id: number, data: Partial<Category>) {
  return client.put(`/pc/api/v1/categories/${id}`, data);
}

export function deleteCategory(id: number) {
  return client.delete(`/pc/api/v1/categories/${id}`);
}
