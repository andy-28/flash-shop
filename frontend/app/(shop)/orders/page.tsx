"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PackageSearch } from "lucide-react";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { ShopNavbar } from "@/components/shop/ShopNavbar";
import { getOrders } from "@/lib/api/orders";
import { useAuthStore } from "@/stores/authStore";
import type { Order } from "@/types";

export default function OrdersPage() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    getOrders()
      .then(setOrders)
      .catch((error) => console.error("Failed to load orders", error))
      .finally(() => setIsLoading(false));
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      <ShopNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#A0A0A0]">Orders</p>
        <h1 className="mt-3 text-4xl font-semibold">My orders</h1>

        {isLoading ? <p className="mt-8 text-[#A0A0A0]">Loading orders...</p> : null}

        {!isLoading && orders.length === 0 ? (
          <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-md border border-[#2A2A2A] bg-[#141414] text-center">
            <PackageSearch className="size-12 text-[#666666]" />
            <p className="mt-4 font-medium">No orders yet.</p>
            <Link href="/products" className="mt-5 inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-medium text-black">
              Browse products
            </Link>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="grid gap-4 rounded-md border border-[#2A2A2A] bg-[#141414] p-4 hover:border-[#404040] md:grid-cols-[1fr_120px_140px_160px]"
            >
              <div>
                <p className="font-medium">{order.orderNo}</p>
                <p className="mt-1 text-sm text-[#A0A0A0]">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <OrderStatusBadge status={order.status} />
              <p className="text-sm text-[#A0A0A0]">{order.itemCount} items</p>
              <p className="font-semibold md:text-right">NT$ {order.finalAmount.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
