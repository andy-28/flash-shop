import Link from "next/link";
import { BarChart3, ClipboardList, FileText, Flame, LayoutDashboard, Package, Settings, ShoppingCart, TicketPercent } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/flash-sale", label: "Flash Sale", icon: Flame },
  { href: "/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/dashboard#analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard#settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="border-r border-white/10 bg-zinc-950">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Link href="/admin/dashboard" className="font-semibold">
          FlashShop CMS
        </Link>
      </div>
      <nav className="grid gap-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-zinc-400 hover:bg-white/10 hover:text-white"
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
