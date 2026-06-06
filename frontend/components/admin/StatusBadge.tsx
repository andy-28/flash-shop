export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  Pending: "warning",
  PreOrdered: "info",
  Paid: "success",
  Shipping: "info",
  Delivered: "success",
  Cancelled: "danger",
  Expired: "neutral",
  Active: "success",
  Inactive: "neutral",
  Draft: "info",
  Published: "success",
  Archived: "neutral",
  Valid: "success",
  FullyUsed: "danger",
  Upcoming: "info",
  Ended: "neutral",
};

const variantClass: Record<BadgeVariant, string> = {
  success: "bg-status-success/10 text-status-success",
  warning: "bg-status-warning/10 text-status-warning",
  danger: "bg-status-danger/10 text-status-danger",
  info: "bg-status-info/10 text-status-info",
  neutral: "bg-text-tertiary/15 text-text-secondary",
};

export function getStatusBadge(status: string): { label: string; variant: BadgeVariant } {
  return {
    label: status,
    variant: statusVariantMap[status] ?? "neutral",
  };
}

export function StatusBadge({ label, variant }: Readonly<StatusBadgeProps>) {
  return <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${variantClass[variant]}`}>{label}</span>;
}
