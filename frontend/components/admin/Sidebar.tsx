"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { adminRoutes, routeGroups } from "@/lib/admin/routes";
import { useAuthStore } from "@/stores/authStore";

export function Sidebar({ onNavigate }: Readonly<{ onNavigate?: () => void }>) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="flex h-screen w-full shrink-0 flex-col border-r border-border-default bg-bg-secondary lg:w-60">
      <div className="flex h-16 items-center border-b border-border-default px-5">
        <Link href="/admin/dashboard" className="font-semibold text-text-primary" onClick={onNavigate}>
          FlashShop Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {routeGroups.map((group) => {
          const routes = adminRoutes.filter((route) => route.group === group.key);
          return (
            <section className="mb-6" key={group.key}>
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-normal text-text-tertiary">{group.label}</p>
              <div className="grid gap-1">
                {routes.map((route) => {
                  const Icon = route.icon;
                  const active = pathname === route.path || pathname.startsWith(`${route.path}/`);
                  return (
                    <Link
                      className={`relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                        active ? "bg-bg-tertiary text-text-primary" : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                      }`}
                      href={route.path}
                      key={route.path}
                      onClick={onNavigate}
                    >
                      {active ? <span className="absolute left-0 top-2 h-6 w-1 rounded-r-full bg-accent-primary" /> : null}
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

      <div className="border-t border-border-default p-4">
        <ThemeToggle showDropdown compact />
        <p className="mt-4 truncate text-sm font-medium text-text-primary">{user?.name ?? "Admin"}</p>
        <p className="mt-1 truncate text-xs text-text-tertiary">{user?.email ?? "admin session"}</p>
        <button
          type="button"
          className="mt-4 inline-flex h-11 w-full items-center gap-2 rounded-md border border-border-default px-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary lg:h-9"
          onClick={logout}
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
