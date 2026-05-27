"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { getAuditLogs } from "@/lib/api/dashboard";

const entityTypes = ["All", "Product", "ContentBlock", "Coupon", "Order", "Inventory"];

export default function AuditLogsPage() {
  const [entityType, setEntityType] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", entityType, page],
    queryFn: () => getAuditLogs(entityType, page, pageSize),
  });

  const totalPages = data ? Math.max(Math.ceil(data.totalCount / data.pageSize), 1) : 1;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-zinc-500">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">操作紀錄</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
          <ClipboardList className="size-4" />
          {data?.totalCount ?? 0} records
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {entityTypes.map((item) => (
          <button
            key={item}
            type="button"
            className={`h-9 rounded-md border px-3 text-sm ${
              entityType === item ? "border-white bg-white text-black" : "border-white/10 bg-[#141414] text-zinc-300 hover:bg-white/10"
            }`}
            onClick={() => {
              setEntityType(item);
              setPage(1);
            }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
        <div className="grid grid-cols-[170px_140px_160px_130px_1fr] border-b border-white/10 bg-[#1E1E1E] px-4 py-3 text-xs font-medium uppercase text-zinc-500">
          <span>Time</span>
          <span>User</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Detail</span>
        </div>
        {isLoading ? <p className="p-4 text-sm text-zinc-400">Loading audit logs...</p> : null}
        {!isLoading && data?.items.length === 0 ? <p className="p-4 text-sm text-zinc-400">No audit logs found.</p> : null}
        {data?.items.map((log) => (
          <div className="grid grid-cols-[170px_140px_160px_130px_1fr] gap-3 px-4 py-4 text-sm" key={log.id}>
            <span className="text-zinc-400">{new Date(log.createdAt).toLocaleString()}</span>
            <span>{log.userName}</span>
            <span className="font-medium">{log.action}</span>
            <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{log.entityType}</span>
            <details className="min-w-0">
              <summary className="cursor-pointer text-zinc-300">View detail</summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-black/40 p-3 text-xs text-zinc-400">
                {formatDetail(log.detail)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="h-9 rounded-md border border-white/10 px-3 text-sm text-zinc-300 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(value - 1, 1))}
        >
          Previous
        </button>
        <span className="text-sm text-zinc-500">
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          className="h-9 rounded-md border border-white/10 px-3 text-sm text-zinc-300 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
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
