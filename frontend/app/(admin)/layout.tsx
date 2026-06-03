"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { useAuthStore } from "@/stores/authStore";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "Admin";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!accessToken) {
      router.push("/login");
      return;
    }

    if (!user) {
      void fetchMe().catch(() => {
        logout();
        router.push("/login");
      });
      return;
    }

    if (!isAdmin) {
      router.push("/login?reason=admin");
    }
  }, [accessToken, fetchMe, hasHydrated, isAdmin, logout, router, user]);

  if (!hasHydrated || !accessToken || !user || !isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-sm text-zinc-400">
        Checking admin access...
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">
          <header className="flex h-16 items-center justify-between border-b border-[#2A2A2A] bg-[#141414] px-5 md:hidden">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border border-[#2A2A2A] text-white"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="size-4" />
            </button>
            <p className="text-sm font-semibold">FlashShop Admin</p>
            <Link href="/" className="inline-flex h-9 items-center rounded-md border border-[#2A2A2A] px-3 text-sm font-medium text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-white">View site</Link>
          </header>
          <main className="p-5 md:p-8">{children}</main>
        </div>
        {isSidebarOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button className="absolute inset-0 bg-black/70" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative h-full w-60">
              <button className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-white" type="button" onClick={() => setIsSidebarOpen(false)}>
                <X className="size-4" />
              </button>
              <Sidebar />
            </div>
          </div>
        ) : null}
    </div>
  );
}
