"use client";

import Link from "next/link";
import { Flame, LayoutDashboard, LogOut, Menu, MessageSquare, ReceiptText, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { NotificationBell } from "@/components/shop/NotificationBell";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
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
      <header className={`sticky top-0 z-20 border-b transition-all duration-300 ${scrolled ? "border-border-default bg-navbar shadow-card" : "border-transparent bg-navbar"} backdrop-blur-md`}>
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-text-primary">
            FlashShop
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            <NavLinks isAdmin={user?.role === "Admin"} isAuthenticated={isAuthenticated} />
            <ThemeToggle />
            <NotificationBell />
            <button
              type="button"
              className="btn-icon relative inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className={`size-4 ${cartBounce ? "animate-bounce" : ""}`} />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-accent-primary px-1 text-xs font-semibold leading-5 text-accent-primary-text">
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
          <div className="flex items-center gap-2 lg:hidden">
            <NotificationBell />
            <button
              type="button"
              className="btn-icon relative inline-flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              onClick={openCart}
              aria-label="Open cart"
            >
              <ShoppingCart className={`size-4 ${cartBounce ? "animate-bounce" : ""}`} />
              {itemCount > 0 ? <span className="absolute -right-1 -top-1 grid min-w-5 rounded-full bg-accent-primary px-1 text-xs font-semibold leading-5 text-accent-primary-text">{itemCount}</span> : null}
            </button>
            <button className="btn-icon inline-flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" type="button" onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
              {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
        {isMenuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-overlay" type="button" aria-label="Close menu" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] animate-slide-in-left flex-col border-r border-border-default bg-bg-primary p-5 shadow-2xl">
              <div className="mb-8 flex items-center justify-between">
                <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-text-primary" onClick={() => setIsMenuOpen(false)}>
                  FlashShop
                </Link>
                <button className="inline-flex size-11 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" type="button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              <div className="grid gap-2" onClick={() => setIsMenuOpen(false)}>
                <NavLinks isAdmin={user?.role === "Admin"} isAuthenticated={isAuthenticated} mobile />
              </div>
              <div className="mt-auto border-t border-border-default pt-5">
                <ThemeToggle showDropdown compact />
                {isAuthenticated && user ? (
                  <div className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
                    <UserAvatar avatarUrl={user.avatarUrl} name={user.displayName || user.name} size={32} />
                    <div className="min-w-0">
                      <p className="truncate text-text-primary">{user.displayName || user.name}</p>
                      <p className="truncate text-xs">{user.email}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <CartDrawer />
    </>
  );
}

function NavLinks({ isAdmin, isAuthenticated, mobile = false }: Readonly<{ isAdmin: boolean; isAuthenticated: boolean; mobile?: boolean }>) {
  const linkClass = `btn-ghost inline-flex items-center gap-2 rounded-md px-3 text-sm text-text-secondary hover:text-text-primary ${mobile ? "h-12 text-base" : "h-9"}`;

  return (
    <>
      <Link href="/" className={linkClass}>
        Home
      </Link>
      <Link href="/products" className={linkClass}>
        <ShoppingBag className="size-4" />
        Products
      </Link>
      <Link href="/contents" className={linkClass}>
        Contents
      </Link>
      <Link href="/flash-sale" className={linkClass}>
        <Flame className="size-4" />
        Flash Sale
      </Link>
      <Link href="/community" className={linkClass}>
        <MessageSquare className="size-4" />
        Community
      </Link>
      {isAuthenticated ? (
        <Link href="/profile" className={linkClass}>
          <User className="size-4" />
          Profile
        </Link>
      ) : (
        <Link href="/login" className={linkClass}>
          Login
        </Link>
      )}
      {isAdmin ? (
        <Link href="/admin/content" className={linkClass}>
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
      <button className="btn-ghost inline-flex h-9 items-center gap-2 rounded-md px-2 text-sm text-text-secondary hover:text-text-primary" type="button" onClick={onToggle}>
        <UserAvatar avatarUrl={user.avatarUrl} name={label} size={28} />
        <span className="max-w-28 truncate">{label}</span>
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-52 animate-scale-in overflow-hidden rounded-lg border border-border-default bg-bg-secondary shadow-xl">
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" href="/profile" onClick={onClose}>
            <User className="size-4" />
            My profile
          </Link>
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" href="/orders" onClick={onClose}>
            <ReceiptText className="size-4" />
            My orders
          </Link>
          <Link className="flex items-center gap-2 px-4 py-3 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary" href="/community" onClick={onClose}>
            <MessageSquare className="size-4" />
            Community
          </Link>
          <button
            className="flex w-full items-center gap-2 border-t border-border-default px-4 py-3 text-left text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
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
