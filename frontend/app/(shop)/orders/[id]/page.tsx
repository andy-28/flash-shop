"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AxiosError } from "axios";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { cancelOrder, getOrder, payOrder } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/authStore";
import type { Order } from "@/types";

function formatRemaining(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${rest.toString().padStart(2, "0")}`;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mutatingAction, setMutatingAction] = useState<"pay" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    getOrder(params.id)
      .then(setOrder)
      .catch((exception) => {
        const axiosError = exception as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message ?? "Unable to load order.");
      })
      .finally(() => setIsLoading(false));
  }, [hasHydrated, isAuthenticated, params.id, router]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remainingSeconds = useMemo(() => {
    if (!order) return 0;
    return Math.floor((new Date(order.expiredAt).getTime() - now) / 1000);
  }, [now, order]);

  async function mutate(action: "pay" | "cancel") {
    if (!order || mutatingAction) return;

    setMutatingAction(action);
    setError(null);
    try {
      const nextOrder = action === "pay" ? await payOrder(order.id) : await cancelOrder(order.id);
      setOrder(nextOrder);
      toast.success(action === "pay" ? "付款成功" : "訂單已取消");
    } catch (exception) {
      const axiosError = exception as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? "Unable to update order.";
      setError(message);
      toast.error(message);
    } finally {
      setMutatingAction(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {isLoading ? <p className="text-[#A0A0A0]">Loading order...</p> : null}
        {error ? <p className="rounded-md border border-[#EF4444]/30 bg-[#EF4444]/10 p-3 text-sm text-[#EF4444]">{error}</p> : null}

        {order ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="border-b border-[#2A2A2A] pb-5">
                <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Order detail</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h1 className="text-3xl font-semibold">{order.orderNo}</h1>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm text-[#A0A0A0]">{new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="mt-6 space-y-3">
                {order.items.map((item, index) => (
                  <article key={`${item.productName}-${item.specName}-${index}`} className="grid gap-4 rounded-md border border-[#2A2A2A] bg-[#141414] p-4 md:grid-cols-[1fr_110px_130px]">
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
            </section>

            <aside className="h-fit rounded-md border border-[#2A2A2A] bg-[#141414] p-5 lg:sticky lg:top-20">
              <h2 className="text-lg font-semibold">Payment</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span>NT$ {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Discount</span>
                  <span className={order.discountAmount > 0 ? "text-[#22C55E]" : undefined}>
                    {order.discountAmount > 0 ? "-" : ""}NT$ {order.discountAmount.toLocaleString()}
                  </span>
                </div>
                {order.couponCode ? (
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Coupon</span>
                    <span>{order.couponCode}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-[#A0A0A0]">Shipping</span>
                  <span>NT$ {order.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-[#2A2A2A] pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>NT$ {order.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 rounded-md border border-[#2A2A2A] bg-black/30 p-3 text-sm">
                <p className="text-[#A0A0A0]">Method</p>
                <p className="mt-1">{order.payment?.method ?? "Mock"}</p>
                <p className="mt-3 text-[#A0A0A0]">Payment status</p>
                <p className="mt-1">{order.payment?.status ?? "Pending"}</p>
                {order.payment?.transactionId ? (
                  <>
                    <p className="mt-3 text-[#A0A0A0]">Transaction</p>
                    <p className="mt-1 break-all">{order.payment.transactionId}</p>
                  </>
                ) : null}
              </div>

              {order.status === "Pending" ? (
                <div className="mt-5 space-y-3">
                  <p className="text-sm text-[#A0A0A0]">
                    Payment expires in <span className="font-semibold text-white">{remainingSeconds > 0 ? formatRemaining(remainingSeconds) : "Expired"}</span>
                  </p>
                  <LoadingButton fullWidth size="lg" isLoading={mutatingAction === "pay"} loadingText="付款處理中..." disabled={!!mutatingAction || remainingSeconds <= 0} onClick={() => mutate("pay")}>
                    付款
                  </LoadingButton>
                  <LoadingButton fullWidth size="lg" variant="ghost" isLoading={mutatingAction === "cancel"} loadingText="取消中..." disabled={!!mutatingAction} onClick={() => mutate("cancel")}>
                    取消訂單
                  </LoadingButton>
                </div>
              ) : null}
              {order.status === "Expired" ? (
                <p className="mt-5 rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-300">
                  訂單已過期，凍結庫存會由系統自動釋放。
                </p>
              ) : null}
            </aside>
          </div>
        ) : null}
      </main>
    </div>
  );
}
