"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage() {
  const router = useRouter();
  const { isLoading, items, removeItem, totalAmount, updateQuantity } = useCartStore();
  const hasUnavailableItem = items.some((item) => !item.isAvailable || item.quantity > item.availableStock);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <ShopNavbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="border-b border-border-default pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-text-secondary">Cart</p>
            <h1 className="mt-3 text-4xl font-semibold">Shopping cart</h1>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-md border border-border-default bg-bg-secondary text-center">
              <ShoppingCart className="size-12 text-text-tertiary" />
              <p className="mt-4 font-medium">Your cart is empty.</p>
              <Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-md bg-accent-primary px-4 text-sm font-medium text-accent-primary-text">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <article key={item.cartItemId} className="grid gap-4 rounded-md border border-border-default bg-bg-secondary p-4 md:grid-cols-[72px_1fr_150px_120px] md:items-center">
                  <div className="size-18 rounded-md bg-bg-elevated" />
                  <div>
                    <h2 className="font-medium">{item.productName}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{item.specName}</p>
                    {!item.isAvailable ? <p className="mt-1 text-xs text-status-danger">This item is no longer available.</p> : null}
                    {item.quantity > item.availableStock ? (
                      <p className="mt-1 text-xs text-status-warning">Only {item.availableStock} left in stock.</p>
                    ) : null}
                    <p className="mt-2 text-sm text-text-secondary">NT$ {item.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex w-fit items-center rounded-md border border-border-default">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center disabled:opacity-40"
                      disabled={item.quantity <= 1 || isLoading}
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center disabled:opacity-40"
                      disabled={item.quantity >= item.availableStock || isLoading}
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <p className="font-semibold">NT$ {item.subtotal.toLocaleString()}</p>
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isLoading}
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span>NT$ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Discount</span>
              <span>NT$ 0</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-border-default pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>NT$ {totalAmount.toLocaleString()}</span>
          </div>
          {hasUnavailableItem ? <p className="mt-3 text-sm text-status-warning">Some items need attention before checkout.</p> : null}
          <button
            type="button"
            className="mt-5 h-11 w-full rounded-md bg-accent-primary text-sm font-medium text-accent-primary-text disabled:opacity-40"
            disabled={items.length === 0 || hasUnavailableItem || isLoading}
            onClick={() => router.push("/checkout")}
          >
            Checkout
          </button>
        </aside>
      </main>
    </div>
  );
}
