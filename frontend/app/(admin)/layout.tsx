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
      <main className="grid min-h-screen place-items-center bg-bg-primary text-sm text-text-secondary">
        Checking admin access...
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">
          <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border-default bg-navbar px-4 backdrop-blur-md lg:hidden">
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-md border border-border-default text-text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="size-5" />
            </button>
            <p className="text-sm font-semibold">FlashShop Admin</p>
            <Link href="/" className="inline-flex h-11 items-center rounded-md border border-border-default px-3 text-sm font-medium text-text-secondary hover:bg-bg-tertiary hover:text-text-primary">Site</Link>
          </header>
          <main className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">{children}</main>
        </div>
        {isSidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-overlay" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />
            <div className="relative h-full w-72 max-w-[85vw] animate-slide-in-left">
              <button className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" type="button" onClick={() => setIsSidebarOpen(false)}>
                <X className="size-4" />
              </button>
              <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        ) : null}
    </div>
  );
}
