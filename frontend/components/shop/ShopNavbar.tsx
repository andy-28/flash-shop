"use client";

import Link from "next/link";
import { Flame, LayoutDashboard, LogOut, Menu, MessageSquare, ReceiptText, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { NotificationBell } from "@/components/shop/NotificationBell";
import { UserAvatar } from "@/components/shop/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import type { AuthUser } from "@/types";
import { useCartStore } from "@/stores/cartStore";

export function ShopNavbar() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const itemCount = useCartStore((state) => state.itemCount);
  const openCart = useCartStore((state) => state.openCart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const cartBounce = useCartStore((state) => state.cartBounce);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (hasHydrated && isAuthenticated && accessToken) {
      void fetchCart();
    }
  }, [accessToken, fetchCart, hasHydrated, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-20 border-b transition-all duration-300 ${scrolled ? "border-white/10 bg-black/90 shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-md" : "border-transparent bg-black/65 backdrop-blur-sm"}`}>
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white">
            FlashShop
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <NavLinks isAdmin={user?.role === "Admin"} isAuthenticated={isAuthenticated} />
            <NotificationBell />
            <button
              type="button"
              className="btn-icon relative inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className={`size-4 ${cartBounce ? "animate-bounce" : ""}`} />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-white px-1 text-xs font-semibold leading-5 text-black">
                  {itemCount}
                </span>
              ) : null}
            </button>
            {isAuthenticated && user ? (
              <UserMenu
                isOpen={isUserMenuOpen}
                onClose={() => setIsUserMenuOpen(false)}
                onLogout={logout}
                onToggle={() => setIsUserMenuOpen((value) => !value)}
                user={user}
              />
            ) : null}
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <NotificationBell />
            <button
              type="button"
              className="btn-icon relative inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className={`size-4 ${cartBounce ? "animate-bounce" : ""}`} />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-white px-1 text-xs font-semibold leading-5 text-black">{itemCount}</span> : null}
            </button>
            <button className="btn-icon inline-flex size-9 items-center justify-center rounded-md text-zinc-300 hover:bg-white/10 hover:text-white" type="button" onClick={() => setIsMenuOpen((value) => !value)} aria-label="Open menu">
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
      <Link href="/" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
        Home
      </Link>
      <Link href="/products" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
        <ShoppingBag className="size-4" />
        Products
      </Link>
      <Link href="/contents" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
        Contents
      </Link>
      <Link href="/flash-sale" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
        <Flame className="size-4" />
        Flash Sale
      </Link>
      <Link href="/community" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
        <MessageSquare className="size-4" />
        Community
      </Link>
      {isAuthenticated ? (
        <Link href="/profile" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
          <User className="size-4" />
          Profile
        </Link>
      ) : (
        <Link href="/login" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
          Login
        </Link>
      )}
      {isAdmin ? (
        <Link href="/admin/content" className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-zinc-300 hover:text-white">
          <LayoutDashboard className="size-4" />
          Admin
        </Link>
      ) : null}
    </>
  );
}

function UserMenu({
  isOpen,
  onClose,
  onLogout,
  onToggle,
  user,
}: Readonly<{
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onToggle: () => void;
  user: AuthUser;
}>) {
  const label = user.displayName || user.name;

  return (
    <div className="relative">
      <button className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-zinc-300 hover:text-white" type="button" onClick={onToggle}>
        <UserAvatar avatarUrl={user.avatarUrl} name={label} size={28} />
        <span className="max-w-28 truncate">{label}</span>
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-52 animate-scaleIn overflow-hidden rounded-lg border border-white/10 bg-[#141414] shadow-xl">
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white" href="/profile" onClick={onClose}>
            <User className="size-4" />
            My profile
          </Link>
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white" href="/orders" onClick={onClose}>
            <ReceiptText className="size-4" />
            My orders
          </Link>
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white" href="/community" onClick={onClose}>
            <MessageSquare className="size-4" />
            Community
          </Link>
          <button
            className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-3 text-left text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
