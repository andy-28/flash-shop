import Link from "next/link";
import { BarChart3, FileText, LayoutDashboard, Package, Settings, ShoppingCart } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/dashboard#contents", label: "Contents", icon: FileText },
  { href: "/admin/dashboard#analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/dashboard#settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-5">
        <Link href="/admin/dashboard" className="font-semibold">
          FlashShop CMS
        </Link>
      </div>
      <nav className="grid gap-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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
