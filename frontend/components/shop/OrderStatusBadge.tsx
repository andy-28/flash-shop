import type { OrderStatus } from "@/types";

const statusClass: Record<OrderStatus, string> = {
  Pending: "bg-[#F59E0B]/15 text-[#F59E0B]",
  Paid: "bg-[#22C55E]/15 text-[#22C55E]",
  Shipping: "bg-[#3B82F6]/15 text-[#3B82F6]",
  Delivered: "bg-purple-500/15 text-purple-300",
  Cancelled: "bg-[#EF4444]/15 text-[#EF4444]",
  Expired: "bg-zinc-500/15 text-zinc-400",
};

const statusLabel: Record<OrderStatus, string> = {
  Pending: "待付款",
  Paid: "已付款",
  Shipping: "配送中",
  Delivered: "已送達",
  Cancelled: "已取消",
  Expired: "已過期",
};

export function OrderStatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[status]}`}>{statusLabel[status]}</span>;
}
