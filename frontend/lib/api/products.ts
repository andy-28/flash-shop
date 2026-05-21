import { apiClient } from "./client";
import type { CreateProductPayload, Product, UpdateInventoryPayload } from "@/types";

export async function getProducts(params?: { search?: string; category?: string }) {
  const response = await apiClient.get<Product[]>("/products", { params });
  return response.data;
}

export async function getProduct(id: string) {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

export async function getAdminProducts(params?: { search?: string; category?: string }) {
  const response = await apiClient.get<Product[]>("/admin/products", { params });
  return response.data;
}

export async function createProduct(payload: CreateProductPayload) {
  const response = await apiClient.post<{ id: string }>("/admin/products", payload);
  return response.data;
}

export async function updateInventory(productId: string, payload: UpdateInventoryPayload) {
  const response = await apiClient.put(`/admin/products/${productId}/inventory`, payload);
  return response.data;
}
