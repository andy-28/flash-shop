import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface AdminRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  group: "main" | "marketing" | "system";
}

export const adminRoutes: AdminRoute[] = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { path: "/admin/products", label: "Products", icon: Package, group: "main" },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart, group: "main" },
  { path: "/admin/content", label: "Content", icon: FileText, group: "marketing" },
  { path: "/admin/coupons", label: "Coupons", icon: Ticket, group: "marketing" },
  { path: "/admin/flash-sale", label: "Flash Sale", icon: Zap, group: "marketing" },
  { path: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList, group: "system" },
];

export const routeGroups = [
  { key: "main", label: "Main" },
  { key: "marketing", label: "Marketing" },
  { key: "system", label: "System" },
] as const;
