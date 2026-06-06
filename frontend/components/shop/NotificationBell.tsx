"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/lib/api/notifications";
import { useAuthStore } from "@/stores/authStore";

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen] = useState(false);
  const unreadQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: () => getNotifications({ page: 1, pageSize: 5 }),
    enabled: isAuthenticated && open,
  });

  if (!isAuthenticated) {
    return null;
  }

  const unreadCount = unreadQuery.data ?? 0;
  const notifications = notificationsQuery.data?.items ?? [];

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);
  }

  async function openNotification(id: string, linkUrl: string | null) {
    await markAsRead(id);
    await refresh();
    setOpen(false);
    if (linkUrl) {
      router.push(linkUrl);
    }
  }

  async function readAll() {
    await markAllAsRead();
    await refresh();
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn-icon relative inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-status-danger" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-30 w-80 animate-scale-in overflow-hidden rounded-lg border border-border-default bg-bg-secondary shadow-xl">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <p className="text-sm font-medium text-text-primary">通知</p>
            <button type="button" className="text-xs text-text-secondary hover:text-text-primary" onClick={readAll}>
              全部已讀
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificationsQuery.isLoading ? <p className="px-4 py-5 text-sm text-text-secondary">Loading...</p> : null}
            {!notificationsQuery.isLoading && notifications.length === 0 ? <p className="px-4 py-5 text-sm text-text-secondary">目前沒有通知</p> : null}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`block w-full border-b border-border-default px-4 py-3 text-left text-sm hover:bg-bg-tertiary ${notification.isRead ? "" : "border-l-2 border-l-[#8B5CF6]"}`}
                onClick={() => openNotification(notification.id, notification.linkUrl)}
              >
                <p className="font-medium text-text-primary">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{notification.message}</p>
                <p className="mt-2 text-xs text-text-tertiary">{new Date(notification.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <button type="button" className="block w-full px-4 py-3 text-left text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" onClick={() => router.push("/notifications")}>
            查看全部 →
          </button>
        </div>
      ) : null}
    </div>
  );
}
