"use client";

import { useEffect, useState } from "react";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, DollarSign, Radio, ReceiptText, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { getDashboardSummary } from "@/lib/api/dashboard";
import { useSignalR } from "@/lib/hooks/useSignalR";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { RecentOrder, TopProduct } from "@/types";

interface DashboardEvent {
  orderNo?: string; OrderNo?: string; amount?: number; Amount?: number; timestamp?: string; Timestamp?: string;
  productName?: string; ProductName?: string; specName?: string; SpecName?: string; availableStock?: number; AvailableStock?: number;
}

export default function AdminDashboardPage() {
  const { isConnected, on } = useSignalR();
  const { data, isLoading } = useQuery({ queryKey: ["admin-dashboard-summary"], queryFn: getDashboardSummary });
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlert, setInventoryAlert] = useState<string | null>(null);
  const recentColumns: Column<RecentOrder>[] = [
    { key: "orderNo", header: "Order", width: "1fr", render: (row) => <div><p className="font-medium">{row.orderNo}</p><p className="text-xs text-[#666666]">{new Date(row.createdAt).toLocaleString()}</p></div> },
    { key: "userName", header: "User", width: "1fr", render: (row) => <div><p>{row.userName}</p><p className="text-xs text-[#666666]">{row.userEmail}</p></div> },
    { key: "status", header: "Status", width: "120px", render: (row) => <StatusBadge {...getStatusBadge(row.status)} /> },
    { key: "finalAmount", header: "Total", width: "120px", render: (row) => formatCurrency(row.finalAmount) },
  ];
  const productColumns: Column<TopProduct>[] = [
    { key: "productName", header: "Product", width: "1fr", render: (row) => <span className="font-medium">{row.productName}</span> },
    { key: "totalSold", header: "Sold", width: "90px", render: (row) => `${row.totalSold}` },
    { key: "totalRevenue", header: "Revenue", width: "120px", render: (row) => formatCurrency(row.totalRevenue) },
  ];

  useEffect(() => {
    if (!data) return;
    setTodayOrders(data.todayOrderCount);
    setTodayRevenue(data.todayRevenue);
    setLowStockCount(data.lowStockCount);
    setRecentOrders(data.recentOrders);
  }, [data]);

  useEffect(() => {
    const offCreated = on("OrderCreated", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventValue(event, "orderNo", "OrderNo", "Live order");
      setTodayOrders((value) => value + 1);
      setRecentOrders((orders) => [{ id: orderNo, orderNo, userName: "Live customer", userEmail: "", status: "Pending", finalAmount: eventNumber(event, "amount", "Amount"), createdAt: eventValue(event, "timestamp", "Timestamp", new Date().toISOString()) }, ...orders.slice(0, 9)]);
    });
    const offPaid = on("OrderPaid", (payload) => {
      const event = payload as DashboardEvent;
      const orderNo = eventValue(event, "orderNo", "OrderNo");
      setTodayRevenue((value) => value + eventNumber(event, "amount", "Amount"));
      setRecentOrders((orders) => orders.map((order) => order.orderNo === orderNo ? { ...order, status: "Paid" } : order));
    });
    const offCancelled = on("OrderCancelled", (payload) => updateOrderStatus(payload as DashboardEvent, "Cancelled", setRecentOrders));
    const offExpired = on("OrderExpired", (payload) => updateOrderStatus(payload as DashboardEvent, "Expired", setRecentOrders));
    const offInventory = on("InventoryAlert", (payload) => {
      const event = payload as DashboardEvent;
      setLowStockCount((value) => value + 1);
      setInventoryAlert(`${eventValue(event, "productName", "ProductName", "Unknown product")} / ${eventValue(event, "specName", "SpecName", "Variant")} has only ${eventNumber(event, "availableStock", "AvailableStock")} left.`);
    });
    return () => { offCreated(); offPaid(); offCancelled(); offExpired(); offInventory(); };
  }, [on]);

  if (isLoading) return <p className="text-sm text-[#A0A0A0]">Loading dashboard...</p>;
  if (!data) return <p className="text-sm text-[#EF4444]">Unable to load dashboard.</p>;

  return (
    <>
      <PageHeader title="Admin Dashboard" description="Realtime commerce and CMS operations overview." breadcrumbs={[{ label: "Dashboard" }]} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-sm text-[#A0A0A0]"><span className={`size-2 rounded-full ${isConnected ? "bg-[#22C55E]" : "bg-[#EF4444]"}`} />{isConnected ? "Live updates on" : "Connecting..."}</span>
        <span className="rounded-md border border-[#2A2A2A] bg-[#141414] px-3 py-2 text-sm text-[#A0A0A0]">Total revenue {formatCurrency(data.totalRevenue)}</span>
      </div>
      {inventoryAlert ? <div className="mb-4 flex items-center gap-2 rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]"><Radio className="size-4" />{inventoryAlert}</div> : null}
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard icon={ReceiptText} label="Today orders" value={todayOrders.toLocaleString()} />
        <StatCard icon={DollarSign} label="Today revenue" tone="success" value={formatCurrency(todayRevenue)} />
        <StatCard icon={Boxes} label="Total products" value={data.totalProducts.toLocaleString()} />
        <StatCard icon={AlertTriangle} label="Low stock alerts" tone={lowStockCount > 0 ? "danger" : "default"} value={lowStockCount.toLocaleString()} />
      </section>
      <section className="mb-6 grid gap-4 xl:grid-cols-2">
        <Chart title="Order trend"><LineChart data={data.dailyStats}><CartesianGrid stroke="#2A2A2A" vertical={false} /><XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} stroke="#A0A0A0" tickLine={false} /><YAxis stroke="#A0A0A0" tickLine={false} allowDecimals={false} /><Tooltip contentStyle={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#FFFFFF" }} /><Line dataKey="orderCount" name="Orders" stroke="#FFFFFF" strokeWidth={2} dot={{ r: 3 }} /></LineChart></Chart>
        <Chart title="Revenue trend"><BarChart data={data.dailyStats}><CartesianGrid stroke="#2A2A2A" vertical={false} /><XAxis dataKey="date" tickFormatter={(value) => String(value).slice(5)} stroke="#A0A0A0" tickLine={false} /><YAxis stroke="#A0A0A0" tickFormatter={(value) => `${Number(value) / 1000}k`} tickLine={false} /><Tooltip contentStyle={{ background: "#1E1E1E", border: "1px solid #2A2A2A", color: "#FFFFFF" }} formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="revenue" name="Revenue" fill="#22C55E" radius={[4, 4, 0, 0]} /></BarChart></Chart>
      </section>
      <section className="mb-6 grid gap-4 xl:grid-cols-2">
        <DataTable columns={recentColumns} data={recentOrders} emptyMessage="No recent orders." />
        <DataTable columns={productColumns} data={data.topProducts} emptyMessage="No paid order data yet." />
      </section>
      <section id="analytics" className="grid gap-4 md:grid-cols-3">
        <StatCard icon={Users} label="Today new users" value={data.todayNewUsers.toLocaleString()} />
        <StatCard icon={ReceiptText} label="Total orders" value={data.totalOrders.toLocaleString()} />
        <StatCard icon={DollarSign} label="Total revenue" tone="success" value={formatCurrency(data.totalRevenue)} />
      </section>
    </>
  );
}

function Chart({ children, title }: Readonly<{ children: ReactElement; title: string }>) {
  return <div className="rounded-md border border-[#2A2A2A] bg-[#141414] p-4"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><span className="text-xs text-[#666666]">Last 7 days</span></div><div className="h-72"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div></div>;
}

function eventValue(data: DashboardEvent, camelKey: keyof DashboardEvent, pascalKey: keyof DashboardEvent, fallback = "") {
  return String(data[camelKey] ?? data[pascalKey] ?? fallback);
}

function eventNumber(data: DashboardEvent, camelKey: keyof DashboardEvent, pascalKey: keyof DashboardEvent) {
  return Number(data[camelKey] ?? data[pascalKey] ?? 0);
}

function updateOrderStatus(payload: DashboardEvent, status: RecentOrder["status"], setRecentOrders: Dispatch<SetStateAction<RecentOrder[]>>) {
  const orderNo = eventValue(payload, "orderNo", "OrderNo");
  setRecentOrders((orders) => orders.map((order) => order.orderNo === orderNo ? { ...order, status } : order));
}
