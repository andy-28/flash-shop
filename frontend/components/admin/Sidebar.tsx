"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { adminRoutes, routeGroups } from "@/lib/admin/routes";
import { useAuthStore } from "@/stores/authStore";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#2A2A2A] bg-[#0A0A0A]">
      <div className="flex h-16 items-center border-b border-[#2A2A2A] px-5">
        <Link href="/admin/dashboard" className="font-semibold text-white">
          FlashShop Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {routeGroups.map((group) => {
          const routes = adminRoutes.filter((route) => route.group === group.key);
          return (
            <section className="mb-6" key={group.key}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-[#666666]">{group.label}</p>
              <div className="grid gap-1">
                {routes.map((route) => {
                  const Icon = route.icon;
                  const active = pathname === route.path || pathname.startsWith(`${route.path}/`);
                  return (
                    <Link
                      className={`relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                        active ? "bg-[#1E1E1E] text-white" : "text-[#A0A0A0] hover:bg-[#141414] hover:text-white"
                      }`}
                      href={route.path}
                      key={route.path}
                    >
                      {active ? <span className="absolute left-0 top-2 h-6 w-1 rounded-r-full bg-white" /> : null}
                      <Icon className="size-4" />
                      {route.label}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>

      <div className="border-t border-[#2A2A2A] p-4">
        <p className="truncate text-sm font-medium text-white">{user?.name ?? "Admin"}</p>
        <p className="mt-1 truncate text-xs text-[#666666]">{user?.email ?? "admin session"}</p>
        <button
          type="button"
          className="mt-4 inline-flex h-9 w-full items-center gap-2 rounded-md border border-[#2A2A2A] px-3 text-sm text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-white"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
