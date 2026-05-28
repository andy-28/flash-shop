"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { getAdminOrders } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Order, OrderStatus } from "@/types";

const statuses: Array<OrderStatus | "All"> = ["All", "Pending", "Paid", "Shipping", "Delivered", "Cancelled", "Expired"];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => getAdminOrders(status),
  });
  const totalRevenue = useMemo(() => orders.filter((order) => order.status === "Paid").reduce((sum, order) => sum + order.finalAmount, 0), [orders]);
  const columns: Column<Order>[] = [
    { key: "orderNo", header: "Order", sortable: true, width: "1fr", render: (row) => <div><p className="font-medium">{row.orderNo}</p><p className="mt-1 text-xs text-[#666666]">{new Date(row.createdAt).toLocaleString()}</p></div> },
    { key: "userName", header: "User", width: "1fr", render: (row) => <div><p>{row.userName ?? "Customer"}</p><p className="text-xs text-[#666666]">{row.userEmail}</p></div> },
    { key: "status", header: "Status", sortable: true, width: "0.7fr", render: (row) => <StatusBadge {...getStatusBadge(row.status)} /> },
    { key: "itemCount", header: "Items", width: "0.5fr" },
    { key: "finalAmount", header: "Total", sortable: true, width: "0.8fr", render: (row) => formatCurrency(row.finalAmount) },
  ];

  return (
    <>
      <PageHeader title="Orders" description={`Paid revenue in current view: ${formatCurrency(totalRevenue)}`} breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]} />
      <FilterBar
        filters={[{
          key: "status",
          label: "Status",
          value: status,
          onChange: (value) => setStatus(value as OrderStatus | "All"),
          options: statuses.map((item) => ({ label: item, value: item })),
        }]}
      />
      {isError ? (
        <div className="rounded-md border border-[#2A2A2A] bg-[#141414] p-4 text-sm text-[#EF4444]">
          Failed to load orders. <button className="underline" type="button" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} emptyMessage="No orders found" isLoading={isLoading} />
      )}
    </>
  );
}
