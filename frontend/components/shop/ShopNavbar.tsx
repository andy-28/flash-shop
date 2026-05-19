import Link from "next/link";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

export function ShopNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
          FlashShop
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ShoppingBag className="size-4" />
            Products
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <LayoutDashboard className="size-4" />
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
