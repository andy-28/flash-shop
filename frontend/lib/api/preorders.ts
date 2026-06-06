import { apiClient } from "./client";
import type { Order } from "@/types";

export async function createPreOrder(variantId: string, quantity = 1) {
  const response = await apiClient.post<Order>("/pre-orders", { variantId, quantity });
  return response.data;
}

export async function cancelPreOrder(orderId: string) {
  const response = await apiClient.delete<Order>(`/pre-orders/${orderId}`);
  return response.data;
}
