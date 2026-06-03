"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export function CartDrawer() {
  const { closeCart, isLoading, isOpen, itemCount, items, removeItem, totalAmount, updateQuantity } = useCartStore();

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close cart" onClick={closeCart} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#2A2A2A] bg-[#141414] text-white shadow-2xl">
        <header className="flex h-16 items-center justify-between border-b border-[#2A2A2A] px-5">
          <div>
            <h2 className="text-lg font-semibold">購物車</h2>
            <p className="text-sm text-[#A0A0A0]">{itemCount} 件商品</p>
          </div>
          <button type="button" className="inline-flex size-9 items-center justify-center rounded-md hover:bg-white/10" onClick={closeCart}>
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingCart className="size-12 text-[#666666]" />
            <p className="mt-4 font-medium">購物車是空的</p>
            <Link
              href="/products"
              className="mt-5 inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-medium text-black"
              onClick={closeCart}
            >
              去逛商品
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {items.map((item) => (
                <article key={item.cartItemId} className="rounded-md border border-[#2A2A2A] bg-[#1E1E1E] p-3">
                  <div className="flex gap-3">
                    <div className="size-16 rounded-md bg-[#252525]" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium">{item.productName}</h3>
                      <p className="mt-1 text-xs text-[#A0A0A0]">{item.specName}</p>
                      {!item.isAvailable ? <p className="mt-1 text-xs text-[#EF4444]">商品目前無法購買</p> : null}
                      {item.quantity > item.availableStock ? (
                        <p className="mt-1 text-xs text-[#F59E0B]">剩餘 {item.availableStock} 件</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isLoading}
                      onClick={() => removeItem(item.cartItemId)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-[#2A2A2A]">
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity <= 1 || isLoading}
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-9 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={item.quantity >= item.availableStock || isLoading}
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#A0A0A0]">NT$ {item.unitPrice.toLocaleString()}</p>
                      <p className="text-sm font-semibold">NT$ {item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <footer className="border-t border-[#2A2A2A] bg-[#141414] p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#A0A0A0]">小計</span>
            <span className="text-xl font-semibold">NT$ {totalAmount.toLocaleString()}</span>
          </div>
          <Link
            href="/cart"
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black"
            onClick={closeCart}
          >
            前往結帳
          </Link>
        </footer>
      </aside>
    </div>
  );
}
