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
        className="btn-icon relative inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 ? <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#EF4444]" /> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-30 w-80 animate-scaleIn overflow-hidden rounded-lg border border-white/10 bg-[#141414] shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-medium text-white">通知</p>
            <button type="button" className="text-xs text-zinc-400 hover:text-white" onClick={readAll}>
              全部已讀
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificationsQuery.isLoading ? <p className="px-4 py-5 text-sm text-zinc-400">Loading...</p> : null}
            {!notificationsQuery.isLoading && notifications.length === 0 ? <p className="px-4 py-5 text-sm text-zinc-400">目前沒有通知</p> : null}
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`block w-full border-b border-white/10 px-4 py-3 text-left text-sm hover:bg-white/10 ${notification.isRead ? "" : "border-l-2 border-l-[#8B5CF6]"}`}
                onClick={() => openNotification(notification.id, notification.linkUrl)}
              >
                <p className="font-medium text-white">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{notification.message}</p>
                <p className="mt-2 text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <button type="button" className="block w-full px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/10 hover:text-white" onClick={() => router.push("/notifications")}>
            查看全部 →
          </button>
        </div>
      ) : null}
    </div>
  );
}
