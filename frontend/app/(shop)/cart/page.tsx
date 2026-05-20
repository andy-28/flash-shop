"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { useCartStore } from "@/stores/cartStore";

export default function CartPage() {
  const { isLoading, items, removeItem, totalAmount, updateQuantity } = useCartStore();
  const hasUnavailableItem = items.some((item) => !item.isAvailable || item.quantity > item.availableStock);

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="border-b border-[#2A2A2A] pb-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Checkout prep</p>
            <h1 className="mt-3 text-4xl font-semibold">購物車</h1>
          </div>

          {items.length === 0 ? (
            <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-center">
              <ShoppingCart className="size-12 text-[#666666]" />
              <p className="mt-4 font-medium">購物車是空的</p>
              <Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-medium text-black">
                去逛逛
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <article key={item.cartItemId} className="grid gap-4 rounded-md border border-[#2A2A2A] bg-[#141414] p-4 md:grid-cols-[72px_1fr_150px_120px] md:items-center">
                  <div className="size-18 rounded-md bg-[#252525]" />
                  <div>
                    <h2 className="font-medium">{item.productName}</h2>
                    <p className="mt-1 text-sm text-[#A0A0A0]">{item.specName}</p>
                    {!item.isAvailable ? <p className="mt-1 text-xs text-[#EF4444]">此商品已下架</p> : null}
                    {item.quantity > item.availableStock ? (
                      <p className="mt-1 text-xs text-[#F59E0B]">庫存僅剩 {item.availableStock} 件</p>
                    ) : null}
                    <p className="mt-2 text-sm text-[#A0A0A0]">NT$ {item.unitPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex w-fit items-center rounded-md border border-[#2A2A2A]">
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
                      className="inline-flex size-9 items-center justify-center rounded-md text-[#A0A0A0] hover:bg-white/10 hover:text-white"
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

        <aside className="h-fit rounded-md border border-[#2A2A2A] bg-[#141414] p-5 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">訂單摘要</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">商品小計</span>
              <span>NT$ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">運費</span>
              <span>免運費</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">折扣</span>
              <span>NT$ 0</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-[#2A2A2A] pt-5 text-lg font-semibold">
            <span>總計</span>
            <span>NT$ {totalAmount.toLocaleString()}</span>
          </div>
          {hasUnavailableItem ? <p className="mt-3 text-sm text-[#F59E0B]">購物車有庫存或下架問題，請先調整。</p> : null}
          <button
            type="button"
            className="mt-5 h-11 w-full rounded-md bg-white text-sm font-medium text-black disabled:opacity-40"
            disabled={items.length === 0 || hasUnavailableItem}
            onClick={() => window.alert("結帳功能將在 Sprint 5 實作")}
          >
            結帳
          </button>
        </aside>
      </main>
    </div>
  );
}
