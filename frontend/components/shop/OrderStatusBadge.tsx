import type { OrderStatus } from "@/types";

export function OrderStatusBadge({ status }: Readonly<{ status: OrderStatus }>) {
  return <span className="rounded-md border px-2 py-1 text-xs">{status}</span>;
}
