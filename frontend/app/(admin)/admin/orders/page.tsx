"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, ShoppingCart } from "lucide-react";
import { getAdminOrders } from "@/lib/api/orders";
import type { Order, OrderStatus } from "@/types";

const statuses: Array<OrderStatus | "All"> = ["All", "Pending", "Paid", "Shipping", "Delivered", "Cancelled", "Expired"];

const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-[#F59E0B]/15 text-[#F59E0B]",
  Paid: "bg-[#22C55E]/15 text-[#22C55E]",
  Shipping: "bg-[#3B82F6]/15 text-[#3B82F6]",
  Delivered: "bg-purple-500/15 text-purple-300",
  Cancelled: "bg-[#EF4444]/15 text-[#EF4444]",
  Expired: "bg-zinc-500/15 text-zinc-400",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAdminOrders(status)
      .then(setOrders)
      .catch((error) => console.error("Failed to load admin orders", error))
      .finally(() => setIsLoading(false));
  }, [status]);

  const totalRevenue = useMemo(
    () => orders.filter((order) => order.status === "Paid").reduce((sum, order) => sum + order.finalAmount, 0),
    [orders],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-zinc-500">Commerce</p>
          <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
          <Filter className="size-4" />
          NT$ {totalRevenue.toLocaleString()} paid revenue
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((item) => (
          <button
            key={item}
            type="button"
            className={`h-9 rounded-md border px-3 text-sm ${
              status === item ? "border-white bg-white text-black" : "border-white/10 bg-[#141414] text-zinc-300 hover:bg-white/10"
            }`}
            onClick={() => setStatus(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
        <div className="grid grid-cols-[1.2fr_1fr_120px_120px_160px] border-b border-white/10 bg-[#1E1E1E] px-4 py-3 text-xs font-medium uppercase text-zinc-500">
          <span>Order</span>
          <span>User</span>
          <span>Status</span>
          <span>Items</span>
          <span className="text-right">Total</span>
        </div>
        {isLoading ? <p className="p-4 text-sm text-zinc-400">Loading orders...</p> : null}
        {!isLoading && orders.length === 0 ? <p className="p-4 text-sm text-zinc-400">No orders found.</p> : null}
        {orders.map((order) => (
          <div className="grid grid-cols-[1.2fr_1fr_120px_120px_160px] items-center px-4 py-4 text-sm" key={order.id}>
            <span className="flex items-center gap-2 font-medium">
              <ShoppingCart className="size-4 text-zinc-500" />
              {order.orderNo}
            </span>
            <span className="text-zinc-300">
              {order.userName ?? "Customer"}
              <span className="block text-xs text-zinc-500">{order.userEmail}</span>
            </span>
            <span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[order.status]}`}>{order.status}</span>
            </span>
            <span className="text-zinc-400">{order.itemCount}</span>
            <span className="text-right font-semibold">NT$ {order.finalAmount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
