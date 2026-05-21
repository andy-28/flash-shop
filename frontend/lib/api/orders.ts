import { apiClient } from "@/lib/api/client";
import type { Order, OrderStatus } from "@/types";

export async function createOrder(): Promise<Order> {
  const response = await apiClient.post<Order>("/api/orders");
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/api/orders");
  return response.data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/api/orders/${orderId}`);
  return response.data;
}

export async function payOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/api/orders/${orderId}/pay`);
  return response.data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/api/orders/${orderId}/cancel`);
  return response.data;
}

export async function getAdminOrders(status?: OrderStatus | "All"): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/api/admin/orders", {
    params: status && status !== "All" ? { status } : undefined,
  });
  return response.data;
}
