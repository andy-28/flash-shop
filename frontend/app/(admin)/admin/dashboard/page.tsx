"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, DollarSign, ReceiptText, Users } from "lucide-react";
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
import type { OrderStatus } from "@/types";

const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-[#F59E0B]/15 text-[#F59E0B]",
  Paid: "bg-[#22C55E]/15 text-[#22C55E]",
  Shipping: "bg-[#3B82F6]/15 text-[#3B82F6]",
  Delivered: "bg-purple-500/15 text-purple-300",
  Cancelled: "bg-[#EF4444]/15 text-[#EF4444]",
  Expired: "bg-zinc-500/15 text-zinc-400",
};

function money(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

function shortDate(value: string) {
  return value.slice(5);
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-summary"],
    queryFn: getDashboardSummary,
  });

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
        <div className="rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
          Total revenue {money(data.totalRevenue)}
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={ReceiptText} label="今日訂單" value={data.todayOrderCount.toLocaleString()} />
        <StatCard icon={DollarSign} label="今日營收" tone="success" value={money(data.todayRevenue)} />
        <StatCard icon={Boxes} label="總商品數" value={data.totalProducts.toLocaleString()} />
        <StatCard
          icon={AlertTriangle}
          label="低庫存警告"
          tone={data.lowStockCount > 0 ? "danger" : "default"}
          value={data.lowStockCount.toLocaleString()}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-[#141414] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">訂單趨勢</h2>
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
            <h2 className="font-semibold">營收趨勢</h2>
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
            <h2 className="font-semibold">最近訂單</h2>
          </div>
          <div className="divide-y divide-white/10">
            {data.recentOrders.length === 0 ? <p className="p-4 text-sm text-zinc-400">No recent orders.</p> : null}
            {data.recentOrders.map((order) => (
              <div className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_1fr_110px_120px] md:items-center" key={order.id}>
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
            <h2 className="font-semibold">熱銷商品</h2>
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
        <StatCard icon={Users} label="今日新會員" value={data.todayNewUsers.toLocaleString()} />
        <StatCard icon={ReceiptText} label="總訂單數" value={data.totalOrders.toLocaleString()} />
        <StatCard icon={DollarSign} label="總營收" tone="success" value={money(data.totalRevenue)} />
      </section>
    </div>
  );
}
