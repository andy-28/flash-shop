import { apiClient } from "@/lib/api/client";
import type { FlashSale, FlashSalePayload } from "@/types";

export async function getActiveFlashSales() {
  const response = await apiClient.get<FlashSale[]>("/flash-sale/active");
  return response.data;
}

export async function getFlashSale(id: string) {
  const response = await apiClient.get<FlashSale>(`/flash-sale/${id}`);
  return response.data;
}

export async function getFlashSaleStock(id: string) {
  const response = await apiClient.get<{ remainingStock: number }>(`/flash-sale/${id}/stock`);
  return response.data;
}

export async function purchaseFlashSale(id: string) {
  const response = await apiClient.post<{ remainingStock: number }>(`/flash-sale/${id}/purchase`);
  return response.data;
}

export async function getAdminFlashSales() {
  const response = await apiClient.get<FlashSale[]>("/admin/flash-sale");
  return response.data;
}

export async function createFlashSale(payload: FlashSalePayload) {
  const response = await apiClient.post<FlashSale>("/admin/flash-sale", payload);
  return response.data;
}

export async function updateFlashSale(id: string, payload: Omit<FlashSalePayload, "variantId">) {
  await apiClient.put(`/admin/flash-sale/${id}`, payload);
}

export async function activateFlashSale(id: string) {
  const response = await apiClient.post<FlashSale>(`/admin/flash-sale/${id}/activate`);
  return response.data;
}

export async function endFlashSale(id: string) {
  await apiClient.post(`/admin/flash-sale/${id}/end`);
}
