import { apiClient } from "./client";
import type { Order } from "@/types";

export async function getOrders() {
  const response = await apiClient.get<Order[]>("/orders");
  return response.data;
}

export async function getOrder(id: string) {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response.data;
}
