"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getNotifications, markAsRead } from "@/lib/api/notifications";

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "page"],
    queryFn: () => getNotifications({ page: 1, pageSize: 50 }),
  });
  const notifications = data?.items ?? [];

  async function openNotification(id: string, linkUrl: string | null) {
    await markAsRead(id);
    await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    if (linkUrl) {
      router.push(linkUrl);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Notifications</p>
        <h1 className="mt-3 text-4xl font-semibold">通知中心</h1>

        {isLoading ? <div className="mt-8 h-64 shimmer rounded-xl" /> : null}
        {!isLoading && notifications.length === 0 ? <p className="mt-8 rounded-md border border-white/10 bg-[#141414] p-6 text-zinc-400">目前沒有通知。</p> : null}
        <div className="mt-8 grid gap-3">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              className={`rounded-md border border-white/10 bg-[#141414] p-4 text-left hover:border-white/30 ${notification.isRead ? "" : "border-l-4 border-l-[#8B5CF6]"}`}
              onClick={() => openNotification(notification.id, notification.linkUrl)}
            >
              <p className="font-medium text-white">{notification.title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{notification.message}</p>
              <p className="mt-3 text-xs text-zinc-500">{new Date(notification.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
