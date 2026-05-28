"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, DollarSign, Radio, ReceiptText, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { useSignalR } from "@/lib/hooks/useSignalR";
import type { OrderStatus, RecentOrder } from "@/types";

const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-[#F59E0B]/15 text-[#F59E0B]",
  Paid: "bg-[#22C55E]/15 text-[#22C55E]",
  Shipping: "bg-[#3B82F6]/15 text-[#3B82F6]",
  Delivered: "bg-purple-500/15 text-purple-300",
  Cancelled: "bg-[#EF4444]/15 text-[#EF4444]",
  Expired: "bg-zinc-500/15 text-zinc-400",
};

interface DashboardEvent {
  orderNo?: string;
  OrderNo?: string;
  amount?: number;
  Amount?: number;
  timestamp?: string;
  Timestamp?: string;
  productName?: string;
  ProductName?: string;
  specName?: string;
  SpecName?: string;
  availableStock?: number;
  AvailableStock?: number;
}

function money(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function shortDate(value: string) {
  return value.slice(5);
}

function eventString(data: DashboardEvent, camelKey: keyof DashboardEvent, pascalKey: keyof DashboardEvent, fallback = "") {
  return String(data[camelKey] ?? data[pascalKey] ?? fallback);
}

function eventNumber(data: DashboardEvent, camelKey: keyof DashboardEvent, pascalKey: keyof DashboardEvent) {
  return Number(data[camelKey] ?? data[pascalKey] ?? 0);
}

export default function AdminDashboardPage() {
  const { isConnected, on } = useSignalR();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getDashboardSummary,
  });
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlert, setInventoryAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      return;
    }

    setTodayOrders(data.todayOrderCount);
    setTodayRevenue(data.todayRevenue);
    setLowStockCount(data.lowStockCount);
    setRecentOrders(data.recentOrders);
  }, [data]);

  useEffect(() => {
    const offCreated = on("OrderCreated", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventString(event, "orderNo", "OrderNo", "Live order");
      const amount = eventNumber(event, "amount", "Amount");
      const timestamp = eventString(event, "timestamp", "Timestamp", new Date().toISOString());

      setTodayOrders((value) => value + 1);
      setRecentOrders((orders) => [
        {
          id: orderNo,
          orderNo,
          userName: "Live customer",
          userEmail: "",
          status: "Pending",
          finalAmount: amount,
          createdAt: timestamp,
        },
        ...orders.slice(0, 9),
      ]);
    });

    const offPaid = on("OrderPaid", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventString(event, "orderNo", "OrderNo");
      const amount = eventNumber(event, "amount", "Amount");

      setTodayRevenue((value) => value + amount);
      setRecentOrders((orders) => orders.map((order) => (order.orderNo === orderNo ? { ...order, status: "Paid" } : order)));
    });

    const offCancelled = on("OrderCancelled", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventString(event, "orderNo", "OrderNo");
      setRecentOrders((orders) => orders.map((order) => (order.orderNo === orderNo ? { ...order, status: "Cancelled" } : order)));
    });

    const offExpired = on("OrderExpired", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventString(event, "orderNo", "OrderNo");
      setRecentOrders((orders) => orders.map((order) => (order.orderNo === orderNo ? { ...order, status: "Expired" } : order)));
    });

    const offInventory = on("InventoryAlert", (payload) => {
      const event = payload as DashboardEvent;
      const productName = eventString(event, "productName", "ProductName", "Unknown product");
      const specName = eventString(event, "specName", "SpecName", "Variant");
      const availableStock = eventNumber(event, "availableStock", "AvailableStock");

      setLowStockCount((value) => value + 1);
      setInventoryAlert(`${productName} / ${specName} has only ${availableStock} left.`);
    });

    return () => {
      offCreated();
      offPaid();
      offCancelled();
      offExpired();
      offInventory();
    };
  }, [on]);

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading dashboard...</p>;
  }

  if (!data) {
    return <p className="text-sm text-[#EF4444]">Unable to load dashboard.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium uppercase text-zinc-500">Operations</p>
          <h1 className="mt-2 text-3xl font-semibold">Admin Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
            <span className={`size-2 rounded-full ${isConnected ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />
            {isConnected ? "Live updates on" : "Connecting..."}
          </div>
          <div className="rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
            Total revenue {money(data.totalRevenue)}
          </div>
        </div>
      </div>

      {inventoryAlert ? (
        <div className="flex items-center gap-2 rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
          <Radio className="size-4" />
          {inventoryAlert}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ReceiptText} label="Today orders" value={todayOrders.toLocaleString()} />
        <StatCard icon={DollarSign} label="Today revenue" tone="success" value={money(todayRevenue)} />
        <StatCard icon={Boxes} label="Total products" value={data.totalProducts.toLocaleString()} />
        <StatCard
          icon={AlertTriangle}
          label="Low stock alerts"
          tone={lowStockCount > 0 ? "danger" : "default"}
          value={lowStockCount.toLocaleString()}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-[#141414] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Order trend</h2>
            <span className="text-xs text-zinc-500">Last 7 days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dailyStats}>
                <CartesianGrid stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke="#A0A0A0" tickLine={false} />
                <YAxis stroke="#A0A0A0" tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#FFFFFF" }} />
                <Line dataKey="orderCount" name="Orders" stroke="#FFFFFF" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-white/10 bg-[#141414] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Revenue trend</h2>
            <span className="text-xs text-zinc-500">Last 7 days</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailyStats}>
                <CartesianGrid stroke="#2A2A2A" vertical={false} />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke="#A0A0A0" tickLine={false} />
                <YAxis stroke="#A0A0A0" tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#FFFFFF" }}
                  formatter={(value) => money(Number(value))}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="font-semibold">Recent orders</h2>
          </div>
          <div className="divide-y divide-white/10">
            {recentOrders.length === 0 ? <p className="p-4 text-sm text-zinc-400">No recent orders.</p> : null}
            {recentOrders.map((order) => (
              <div className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_1fr_110px_120px] md:items-center" key={`${order.id}-${order.orderNo}`}>
                <div>
                  <p className="font-medium">{order.orderNo}</p>
                  <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-zinc-300">
                  {order.userName}
                  <p className="text-xs text-zinc-500">{order.userEmail}</p>
                </div>
                <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[order.status]}`}>
                  {order.status}
                </span>
                <p className="font-semibold md:text-right">{money(order.finalAmount)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="font-semibold">Top products</h2>
          </div>
          <div className="divide-y divide-white/10">
            {data.topProducts.length === 0 ? <p className="p-4 text-sm text-zinc-400">No paid order data yet.</p> : null}
            {data.topProducts.map((product, index) => (
              <div className="grid grid-cols-[42px_1fr_90px_120px] items-center gap-3 p-4 text-sm" key={product.productId}>
                <span className="text-zinc-500">#{index + 1}</span>
                <p className="font-medium">{product.productName}</p>
                <p className="text-zinc-300">{product.totalSold} sold</p>
                <p className="text-right font-semibold">{money(product.totalRevenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="analytics" className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Today new users" value={data.todayNewUsers.toLocaleString()} />
        <StatCard icon={ReceiptText} label="Total orders" value={data.totalOrders.toLocaleString()} />
        <StatCard icon={DollarSign} label="Total revenue" tone="success" value={money(data.totalRevenue)} />
      </section>
    </div>
  );
}
