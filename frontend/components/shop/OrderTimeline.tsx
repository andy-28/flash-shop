import { Check, Circle, PackageCheck, X } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { formatDate } from "@/lib/utils/formatDate";

const terminalStatus: Partial<Record<OrderStatus, { label: string; tone: "danger" | "neutral" }>> = {
  Cancelled: { label: "Cancelled", tone: "danger" },
  Expired: { label: "Expired", tone: "neutral" },
};

export function OrderTimeline({ order }: Readonly<{ order: Order }>) {
  const steps = buildTimeline(order);

  return (
    <div className="rounded-md border border-border-default bg-bg-secondary p-5">
      <h2 className="text-lg font-semibold">Order timeline</h2>
      <ol className="mt-5 space-y-0">
        {steps.map((step, index) => (
          <li className="grid grid-cols-[28px_1fr] gap-3" key={step.label}>
            <div className="flex flex-col items-center">
              <span className={`grid size-7 place-items-center rounded-full border ${stepClass(step.state)}`}>
                {step.state === "failed" ? <X className="size-4" /> : step.state === "done" ? <Check className="size-4" /> : step.state === "current" ? <PackageCheck className="size-4" /> : <Circle className="size-3" />}
              </span>
              {index < steps.length - 1 ? <span className={`h-14 w-px ${step.state === "done" ? "bg-border-hover" : "bg-border-default"}`} /> : null}
            </div>
            <div className="pb-6">
              <p className="font-medium text-text-primary">{step.label}</p>
              {step.time ? <p className="mt-1 text-xs text-text-secondary">{formatDate(step.time)}</p> : null}
              {step.description ? <p className="mt-2 whitespace-pre-line text-sm leading-6 text-text-secondary">{step.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function buildTimeline(order: Order) {
  const steps: Array<{ label: string; time?: string | null; description?: string; state: "done" | "current" | "todo" | "failed" }> = [
    { label: "Order created", time: order.createdAt, state: "done" },
  ];

  if (terminalStatus[order.status]) {
    const terminal = terminalStatus[order.status]!;
    steps.push({ label: terminal.label, time: order.expiredAt, state: terminal.tone === "danger" ? "failed" : "todo" });
    return steps;
  }

  if (order.status === "PreOrdered") {
    steps.push({ label: "Pre-ordered", time: order.createdAt, state: "current", description: "Waiting for arrival notification." });
    steps.push({ label: "Payment opens", time: null, state: "todo" });
    return steps;
  }

  const paidDone = ["Paid", "Shipping", "Delivered"].includes(order.status);
  steps.push({ label: "Paid", time: order.paidAt, state: paidDone ? "done" : "todo" });

  const shipment = order.shipment;
  const shippingDone = ["Shipping", "Delivered"].includes(order.status);
  steps.push({
    label: "Shipped",
    time: shipment?.shippedAt,
    state: order.status === "Shipping" ? "current" : shippingDone ? "done" : "todo",
    description: shipment ? `${shipment.carrier}${shipment.trackingNo ? `\nTracking no: ${shipment.trackingNo}` : ""}` : undefined,
  });

  steps.push({
    label: "Delivered",
    time: shipment?.deliveredAt,
    state: order.status === "Delivered" ? "done" : "todo",
  });

  return steps;
}

function stepClass(state: "done" | "current" | "todo" | "failed") {
  if (state === "done") return "border-status-success bg-status-success/15 text-status-success";
  if (state === "current") return "animate-pulse border-accent-primary bg-bg-tertiary text-text-primary";
  if (state === "failed") return "border-status-danger bg-status-danger/15 text-status-danger";
  return "border-text-tertiary bg-bg-tertiary text-text-tertiary";
}
