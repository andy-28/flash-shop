"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { AxiosError } from "axios";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { createOrder } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { clearCart, fetchCart, items, totalAmount } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    void fetchCart();
  }, [fetchCart, hasHydrated, isAuthenticated, router]);

  const submitOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const order = await createOrder();
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section>
          <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Checkout</p>
          <h1 className="mt-3 text-4xl font-semibold">Confirm your order</h1>

          {items.length === 0 ? (
            <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-center">
              <ShoppingBag className="size-12 text-[#666666]" />
              <p className="mt-4 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <article key={item.cartItemId} className="grid gap-4 rounded-md border border-[#2A2A2A] bg-[#141414] p-4 md:grid-cols-[1fr_110px_120px] md:items-center">
                  <div>
                    <h2 className="font-medium">{item.productName}</h2>
                    <p className="mt-1 text-sm text-[#A0A0A0]">{item.specName}</p>
                    <p className="mt-2 text-sm text-[#A0A0A0]">NT$ {item.unitPrice.toLocaleString()} x {item.quantity}</p>
                  </div>
                  <p className="text-sm text-[#A0A0A0]">Qty {item.quantity}</p>
                  <p className="font-semibold md:text-right">NT$ {item.subtotal.toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-md border border-[#2A2A2A] bg-[#141414] p-5 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Subtotal</span>
              <span>NT$ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0]">Discount</span>
              <span>NT$ 0</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-[#2A2A2A] pt-5 text-lg font-semibold">
            <span>Total</span>
            <span>NT$ {totalAmount.toLocaleString()}</span>
          </div>
          {error ? <p className="mt-3 text-sm text-[#EF4444]">{error}</p> : null}
          <button
            type="button"
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-md bg-white text-sm font-medium text-black disabled:opacity-40"
            disabled={items.length === 0 || isSubmitting}
            onClick={submitOrder}
          >
            {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Place order
          </button>
        </aside>
      </main>
    </div>
  );
}
