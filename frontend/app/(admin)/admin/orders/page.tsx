"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { LoadingButton } from "@/components/shared/LoadingButton";
import { deliverOrder, getAdminOrders, shipOrder, updateTracking } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Order, OrderStatus } from "@/types";

const statuses: Array<OrderStatus | "All"> = ["All", "Pending", "PreOrdered", "Paid", "Shipping", "Delivered", "Cancelled", "Expired"];

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState<OrderStatus | "All">("All");
  const [shipTarget, setShipTarget] = useState<Order | null>(null);
  const [trackingTarget, setTrackingTarget] = useState<Order | null>(null);
  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders", status],
    queryFn: () => getAdminOrders(status),
  });
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard-summary"] });
  };
  const shipMutation = useMutation({
    mutationFn: ({ orderId, carrier, trackingNo }: { orderId: string; carrier: string; trackingNo?: string }) => shipOrder(orderId, { carrier, trackingNo }),
    onSuccess: async () => {
      toast.success("Order shipped");
      setShipTarget(null);
      await invalidate();
    },
    onError: () => toast.error("Failed to ship order"),
  });
  const deliverMutation = useMutation({
    mutationFn: deliverOrder,
    onSuccess: async () => {
      toast.success("Order delivered");
      await invalidate();
    },
    onError: () => toast.error("Failed to mark delivered"),
  });
  const trackingMutation = useMutation({
    mutationFn: ({ orderId, trackingNo }: { orderId: string; trackingNo: string }) => updateTracking(orderId, trackingNo),
    onSuccess: async () => {
      toast.success("Tracking updated");
      setTrackingTarget(null);
      await invalidate();
    },
    onError: () => toast.error("Failed to update tracking"),
  });
  const totalRevenue = useMemo(() => orders.filter((order) => ["Paid", "Shipping", "Delivered"].includes(order.status)).reduce((sum, order) => sum + order.finalAmount, 0), [orders]);
  const columns: Column<Order>[] = [
    { key: "orderNo", header: "Order", sortable: true, width: "1fr", render: (row) => <div><p className="font-medium">{row.orderNo}</p><p className="mt-1 text-xs text-text-tertiary">{new Date(row.createdAt).toLocaleString()}</p></div> },
    { key: "userName", header: "User", width: "1fr", render: (row) => <div><p>{row.userName ?? "Customer"}</p><p className="text-xs text-text-tertiary">{row.userEmail}</p></div> },
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
        <div className="rounded-md border border-border-default bg-bg-secondary p-4 text-sm text-status-danger">
          Failed to load orders. <button className="underline" type="button" onClick={() => void refetch()}>Retry</button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          emptyMessage="No orders found"
          isLoading={isLoading}
          actions={(order) => (
            <OrderActions
              isDelivering={deliverMutation.isPending}
              order={order}
              onDeliver={() => deliverMutation.mutate(order.id)}
              onShip={() => setShipTarget(order)}
              onTracking={() => setTrackingTarget(order)}
            />
          )}
        />
      )}
      <ShipDialog
        isLoading={shipMutation.isPending}
        order={shipTarget}
        onClose={() => setShipTarget(null)}
        onSubmit={(carrier, trackingNo) => shipTarget ? shipMutation.mutate({ orderId: shipTarget.id, carrier, trackingNo }) : undefined}
      />
      <TrackingDialog
        isLoading={trackingMutation.isPending}
        order={trackingTarget}
        onClose={() => setTrackingTarget(null)}
        onSubmit={(trackingNo) => trackingTarget ? trackingMutation.mutate({ orderId: trackingTarget.id, trackingNo }) : undefined}
      />
    </>
  );
}

function OrderActions({
  isDelivering,
  onDeliver,
  onShip,
  onTracking,
  order,
}: Readonly<{
  isDelivering: boolean;
  order: Order;
  onShip: () => void;
  onDeliver: () => void;
  onTracking: () => void;
}>) {
  if (order.status === "Paid") {
    return <button className="h-8 rounded-md bg-accent-primary px-3 text-xs font-medium text-accent-primary-text hover:opacity-90" type="button" onClick={onShip}>Ship</button>;
  }

  if (order.status === "Shipping") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <button className="h-8 rounded-md border border-border-default px-3 text-xs text-text-primary hover:bg-bg-tertiary" type="button" onClick={onTracking}>Tracking</button>
        <LoadingButton isLoading={isDelivering} size="sm" onClick={onDeliver}>Deliver</LoadingButton>
      </div>
    );
  }

  return <span className="text-xs text-text-tertiary">No action</span>;
}

function ShipDialog({ isLoading, onClose, onSubmit, order }: Readonly<{ order: Order | null; isLoading: boolean; onClose: () => void; onSubmit: (carrier: string, trackingNo?: string) => void }>) {
  const [carrier, setCarrier] = useState("Black Cat");
  const [trackingNo, setTrackingNo] = useState("");
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-overlay px-4">
      <section className="w-full max-w-md rounded-xl border border-border-default bg-bg-secondary p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">Ship order {order.orderNo}</h2>
        <label className="mt-5 grid gap-2 text-sm text-text-secondary">Carrier<input className="h-10 rounded-md border border-border-default bg-bg-primary px-3 text-text-primary outline-none" value={carrier} onChange={(event) => setCarrier(event.target.value)} /></label>
        <label className="mt-4 grid gap-2 text-sm text-text-secondary">Tracking no<input className="h-10 rounded-md border border-border-default bg-bg-primary px-3 text-text-primary outline-none" value={trackingNo} onChange={(event) => setTrackingNo(event.target.value)} /></label>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-10 rounded-md px-4 text-sm text-text-secondary hover:bg-bg-tertiary" type="button" onClick={onClose}>Cancel</button>
          <LoadingButton disabled={!carrier.trim()} isLoading={isLoading} onClick={() => onSubmit(carrier, trackingNo || undefined)}>Confirm shipment</LoadingButton>
        </div>
      </section>
    </div>
  );
}

function TrackingDialog({ isLoading, onClose, onSubmit, order }: Readonly<{ order: Order | null; isLoading: boolean; onClose: () => void; onSubmit: (trackingNo: string) => void }>) {
  const [trackingNo, setTrackingNo] = useState(order?.shipment?.trackingNo ?? "");
  useEffect(() => {
    setTrackingNo(order?.shipment?.trackingNo ?? "");
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-overlay px-4">
      <section className="w-full max-w-md rounded-xl border border-border-default bg-bg-secondary p-5 shadow-2xl">
        <h2 className="text-lg font-semibold">Update tracking</h2>
        <label className="mt-5 grid gap-2 text-sm text-text-secondary">Tracking no<input className="h-10 rounded-md border border-border-default bg-bg-primary px-3 text-text-primary outline-none" value={trackingNo} onChange={(event) => setTrackingNo(event.target.value)} /></label>
        <div className="mt-6 flex justify-end gap-2">
          <button className="h-10 rounded-md px-4 text-sm text-text-secondary hover:bg-bg-tertiary" type="button" onClick={onClose}>Cancel</button>
          <LoadingButton isLoading={isLoading} onClick={() => onSubmit(trackingNo)}>Update</LoadingButton>
        </div>
      </section>
    </div>
  );
}
