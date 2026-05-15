import { apiClient } from "./client";
import type { Product } from "@/types";

export async function getProducts() {
  const response = await apiClient.get<Product[]>("/products");
  return response.data;
}

export async function getProduct(id: string) {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}
