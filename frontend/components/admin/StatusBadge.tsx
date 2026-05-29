export type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  Pending: "warning",
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
  success: "bg-[#22C55E]/10 text-[#22C55E]",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
  danger: "bg-[#EF4444]/10 text-[#EF4444]",
  info: "bg-[#3B82F6]/10 text-[#3B82F6]",
  neutral: "bg-[#666666]/15 text-[#A0A0A0]",
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
