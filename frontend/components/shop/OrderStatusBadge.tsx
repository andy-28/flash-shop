import type { OrderStatus } from "@/types";

const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-status-warning/15 text-status-warning",
  PreOrdered: "bg-[#8B5CF6]/15 text-[#C4B5FD]",
  Paid: "bg-status-success/15 text-status-success",
  Shipping: "bg-status-info/15 text-status-info",
  Delivered: "bg-purple-500/15 text-purple-300",
  Cancelled: "bg-status-danger/15 text-status-danger",
  Expired: "bg-zinc-500/15 text-text-secondary",
};

const statusLabel: Record<OrderStatus, string> = {
  Pending: "待付款",
  PreOrdered: "預購中",
  Paid: "已付款",
  Shipping: "出貨中",
  Delivered: "已送達",
  Cancelled: "已取消",
  Expired: "已過期",
};

export function OrderStatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[status]}`}>{statusLabel[status]}</span>;
}
