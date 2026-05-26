import { apiClient } from "@/lib/api/client";
import type { Order, OrderStatus } from "@/types";

export async function createOrder(couponCode?: string): Promise<Order> {
  const response = await apiClient.post<Order>("/orders", couponCode ? { couponCode } : {});
  return response.data;
}

export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/orders");
  return response.data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function payOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/orders/${orderId}/pay`);
  return response.data;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function getAdminOrders(status?: OrderStatus | "All"): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/admin/orders", {
    params: status && status !== "All" ? { status } : undefined,
  });
  return response.data;
}
