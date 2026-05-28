"use client";

import { useState } from "react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/lib/api/dashboard";
import type { AuditLog } from "@/types";

const entityTypes = ["All", "Product", "ContentBlock", "Coupon", "Order", "Inventory"];

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", entityType, page],
    queryFn: () => getAuditLogs(entityType, page, pageSize),
  });
  const columns: Column<AuditLog>[] = [
    { key: "createdAt", header: "Time", sortable: true, width: "170px", render: (row) => <span className="text-[#A0A0A0]">{new Date(row.createdAt).toLocaleString()}</span> },
    { key: "userName", header: "User", width: "140px" },
    { key: "action", header: "Action", sortable: true, width: "160px", render: (row) => <span className="font-medium">{row.action}</span> },
    { key: "entityType", header: "Entity", width: "130px", render: (row) => <StatusBadge label={row.entityType} variant="neutral" /> },
    { key: "detail", header: "Detail", width: "1fr", render: (row) => <details><summary className="cursor-pointer text-[#A0A0A0]">View detail</summary><pre className="mt-2 max-h-40 overflow-auto rounded-md bg-black/40 p-3 text-xs text-[#A0A0A0]">{formatDetail(row.detail)}</pre></details> },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" description="Review admin actions and entity changes." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Audit Logs" }]} />
      <FilterBar filters={[{ key: "entityType", label: "Entity", value: entityType, onChange: (value) => { setEntityType(value); setPage(1); }, options: entityTypes.map((item) => ({ label: item, value: item })) }]} />
      <DataTable columns={columns} data={data?.items ?? []} emptyMessage="No audit logs found" isLoading={isLoading} page={data?.page ?? page} pageSize={data?.pageSize ?? pageSize} totalCount={data?.totalCount ?? 0} onPageChange={setPage} />
    </>
  );
}

function formatDetail(detail: string | null) {
  if (!detail) {
    return "{}";
  }

  try {
    return JSON.stringify(JSON.parse(detail), null, 2);
  } catch {
    return detail;
  }
}
