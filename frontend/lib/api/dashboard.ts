import { apiClient } from "@/lib/api/client";
import type { AuditLogList, DashboardSummary } from "@/types";

export async function getDashboardSummary() {
  const response = await apiClient.get<DashboardSummary>("/admin/dashboard/summary");
  return response.data;
}

export async function getAuditLogs(entityType?: string, page = 1, pageSize = 20) {
  const response = await apiClient.get<AuditLogList>("/admin/audit-logs", {
    params: {
      entityType: entityType && entityType !== "All" ? entityType : undefined,
      page,
      pageSize,
    },
  });
  return response.data;
}
