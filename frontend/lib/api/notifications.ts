import { apiClient } from "./client";
import type { Notification, PagedResult } from "@/types";

export async function getNotifications(params?: { page?: number; pageSize?: number }) {
  const response = await apiClient.get<PagedResult<Notification>>("/notifications", { params });
  return response.data;
}

export async function getUnreadCount() {
  const response = await apiClient.get<{ count: number }>("/notifications/unread-count");
  return response.data.count;
}

export async function markAsRead(notificationId: string) {
  await apiClient.post(`/notifications/${notificationId}/read`);
}

export async function markAllAsRead() {
  await apiClient.post("/notifications/read-all");
}
