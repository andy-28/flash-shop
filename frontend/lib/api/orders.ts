import { apiClient } from "@/lib/api/client";
import type { Order, OrderStatus, Shipment } from "@/types";

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

export async function shipOrder(orderId: string, data: { carrier: string; trackingNo?: string | null }): Promise<Shipment> {
  const response = await apiClient.post<Shipment>(`/admin/orders/${orderId}/ship`, data);
  return response.data;
}

export async function deliverOrder(orderId: string): Promise<Shipment> {
  const response = await apiClient.post<Shipment>(`/admin/orders/${orderId}/deliver`);
  return response.data;
}

export async function updateTracking(orderId: string, trackingNo: string | null): Promise<Shipment> {
  const response = await apiClient.put<Shipment>(`/admin/orders/${orderId}/tracking`, { trackingNo });
  return response.data;
}

export async function getShipment(orderId: string): Promise<Shipment | null> {
  const response = await apiClient.get<Shipment | null>(`/orders/${orderId}/shipment`);
  return response.data;
}
