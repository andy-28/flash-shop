"use client";

import Link from "next/link";
import { Flame, LayoutDashboard, Menu, ReceiptText, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export function ShopNavbar() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const itemCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && accessToken) {
      void fetchCart();
    }
  }, [accessToken, fetchCart, hasHydrated, isAuthenticated]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
            FlashShop
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <NavLinks isAdmin={user?.role === "Admin"} isAuthenticated={isAuthenticated} />
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
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className="size-4" />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-white px-1 text-xs font-semibold leading-5 text-black">{itemCount}</span> : null}
            </button>
            <button className="inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white" type="button" onClick={() => setIsMenuOpen((value) => !value)} aria-label="Open menu">
              {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
        {isMenuOpen ? (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <div className="grid gap-1" onClick={() => setIsMenuOpen(false)}>
              <NavLinks isAdmin={user?.role === "Admin"} isAuthenticated={isAuthenticated} />
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
    </>
  );
}

function NavLinks({ isAdmin, isAuthenticated }: Readonly<{ isAdmin: boolean; isAuthenticated: boolean }>) {
  return (
    <>
      <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
        Home
      </Link>
      <Link href="/products" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
        <ShoppingBag className="size-4" />
        Products
      </Link>
      <Link href="/flash-sale" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
        <Flame className="size-4" />
        Flash Sale
      </Link>
      {isAuthenticated ? (
        <Link href="/orders" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
          <ReceiptText className="size-4" />
          Orders
        </Link>
      ) : (
        <Link href="/login" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
          Login
        </Link>
      )}
      {isAdmin ? (
        <Link href="/admin/content" className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
          <LayoutDashboard className="size-4" />
          Admin
        </Link>
      ) : null}
    </>
  );
}
