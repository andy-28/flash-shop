"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  page?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends object>({
  actions,
  columns,
  data,
  emptyMessage = "No records found",
  isLoading = false,
  onPageChange,
  onRowClick,
  page = 1,
  pageSize = data.length || 10,
  totalCount = data.length,
}: Readonly<DataTableProps<T>>) {
  const [sort, setSort] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const gridTemplateColumns = `${columns.map((column) => column.width ?? "1fr").join(" ")}${actions ? " auto" : ""}`;
  const sortedData = useMemo(() => {
    if (!sort) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = String((a as Record<string, unknown>)[sort.key] ?? "");
      const bValue = String((b as Record<string, unknown>)[sort.key] ?? "");
      return sort.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [data, sort]);
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const totalPages = Math.max(Math.ceil(totalCount / Math.max(pageSize, 1)), 1);

  function toggleSort(key: string) {
    setSort((current) => {
      if (current?.key !== key) {
        return { key, direction: "asc" };
      }

      return { key, direction: current.direction === "asc" ? "desc" : "asc" };
    });
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#2A2A2A] bg-[#141414]">
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid border-b border-[#2A2A2A] px-4 py-3 text-xs font-medium uppercase text-[#A0A0A0]" style={{ gridTemplateColumns }}>
            {columns.map((column) => {
              const active = sort?.key === column.key;
              const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
              return (
                <button
                  key={column.key}
                  type="button"
                  className={`flex items-center gap-1 text-left ${column.sortable ? "hover:text-white" : "cursor-default"}`}
                  disabled={!column.sortable}
                  onClick={() => column.sortable && toggleSort(column.key)}
                >
                  {column.header}
                  {column.sortable ? <SortIcon className="size-3" /> : null}
                </button>
              );
            })}
            {actions ? <span /> : null}
          </div>

          {isLoading ? (
            <div className="divide-y divide-[#2A2A2A]">
              {Array.from({ length: Math.min(pageSize, 5) }).map((_, index) => (
                <div className="grid gap-4 px-4 py-4" key={index} style={{ gridTemplateColumns }}>
                  {columns.map((column) => (
                    <span className="h-4 animate-pulse rounded bg-[#252525]" key={column.key} />
                  ))}
                  {actions ? <span className="h-4 w-16 animate-pulse rounded bg-[#252525]" /> : null}
                </div>
              ))}
            </div>
          ) : sortedData.length === 0 ? (
            <EmptyState title={emptyMessage} />
          ) : (
            <div className="divide-y divide-[#2A2A2A]">
              {sortedData.map((row, rowIndex) => (
                <div
                  className={`grid items-center gap-4 px-4 py-4 text-sm text-white hover:bg-[#1E1E1E] ${onRowClick ? "cursor-pointer" : ""}`}
                  key={String((row as Record<string, unknown>).id ?? rowIndex)}
                  onClick={() => onRowClick?.(row)}
                  style={{ gridTemplateColumns }}
                >
                  {columns.map((column) => (
                    <div className="min-w-0 text-[#FFFFFF]" key={column.key}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}
                    </div>
                  ))}
                  {actions ? <div className="flex justify-end gap-2" onClick={(event) => event.stopPropagation()}>{actions(row)}</div> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {onPageChange ? (
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-4 py-3 text-sm text-[#A0A0A0]">
          <span>{start}-{end} of {totalCount}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] text-white disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-xs">Page {page} / {totalPages}</span>
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] text-white disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
