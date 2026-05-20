"use client";

import Link from "next/link";
import { LayoutDashboard, ShoppingBag, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export function ShopNavbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const itemCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  return (
    <>
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
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="size-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-white px-1 text-xs font-semibold leading-5 text-black">
                  {itemCount}
                </span>
              ) : null}
            </button>
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
      <CartDrawer />
    </>
  );
}
