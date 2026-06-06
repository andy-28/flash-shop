"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Play, Square, Zap } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { activateFlashSale, createFlashSale, endFlashSale, getAdminFlashSales } from "@/lib/api/flashSale";
import { getAdminProducts } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { FlashSale, FlashSalePayload } from "@/types";

const initialForm = { variantId: "", title: "", flashPrice: "99", totalStock: "10", perUserLimit: "1", startAt: toLocalInput(new Date()), endAt: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)) };

export default function AdminFlashSalePage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const { data: sales = [], isLoading } = useQuery({ queryKey: ["admin-flash-sales"], queryFn: getAdminFlashSales });
  const { data: products = [] } = useQuery({ queryKey: ["admin-products-for-flash-sale"], queryFn: () => getAdminProducts() });
  const variants = useMemo(() => products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))), [products]);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
  const createMutation = useMutation({ mutationFn: createFlashSale, onSuccess: async () => { setForm(initialForm); toast.success("Flash sale created"); await refresh(); }, onError: () => toast.error("Failed to create flash sale") });
  const activateMutation = useMutation({ mutationFn: activateFlashSale, onSuccess: async () => { toast.success("Flash sale activated"); await refresh(); } });
  const endMutation = useMutation({ mutationFn: endFlashSale, onSuccess: async () => { toast.success("Flash sale ended"); await refresh(); } });
  const columns: Column<FlashSale>[] = [
    { key: "title", header: "Sale", sortable: true, width: "1.3fr", render: (row) => <div><p className="font-medium">{row.title}</p><p className="mt-1 text-xs text-text-tertiary">{row.productName} / {row.specName}</p></div> },
    { key: "flashPrice", header: "Price", sortable: true, width: "110px", render: (row) => formatCurrency(row.flashPrice) },
    { key: "soldCount", header: "Stock", width: "110px", render: (row) => `${row.soldCount}/${row.totalStock}` },
    { key: "startAt", header: "Window", width: "180px", render: (row) => <span className="text-xs text-text-secondary">{new Date(row.startAt).toLocaleString()}<br />{new Date(row.endAt).toLocaleString()}</span> },
    { key: "status", header: "Status", sortable: true, width: "110px", render: (row) => <StatusBadge {...getStatusBadge(row.status)} /> },
  ];

  function create() {
    const payload: FlashSalePayload = { variantId: form.variantId, title: form.title, flashPrice: Number(form.flashPrice), totalStock: Number(form.totalStock), perUserLimit: Number(form.perUserLimit), startAt: new Date(form.startAt).toISOString(), endAt: new Date(form.endAt).toISOString() };
    return createMutation.mutateAsync(payload);
  }

  return (
    <>
      <PageHeader title="Flash Sale" description="Manage Redis pre-deduction campaigns." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Flash Sale" }]} action={{ label: "Reset Form", icon: Flame, onClick: () => setForm(initialForm) }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataTable
          columns={columns}
          data={sales}
          emptyMessage="No flash sales found"
          isLoading={isLoading}
          actions={(sale) => (<><button className="inline-flex size-8 items-center justify-center rounded-md border border-border-default disabled:opacity-40" disabled={sale.status === "Active" || activateMutation.isPending} type="button" onClick={() => activateMutation.mutate(sale.id)}><Play className="size-4" /></button><button className="inline-flex size-8 items-center justify-center rounded-md border border-border-default disabled:opacity-40" disabled={sale.status !== "Active" || endMutation.isPending} type="button" onClick={() => endMutation.mutate(sale.id)}><Square className="size-4" /></button></>)}
        />
        <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 xl:sticky xl:top-8">
          <FormSection title="Create Flash Sale" description="Choose a variant and load campaign stock into Redis on activation.">
            <FormField label="Variant" required><select className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" value={form.variantId} onChange={(event) => setForm((value) => ({ ...value, variantId: event.target.value }))}><option value="">Select variant</option>{variants.map(({ product, variant }) => <option key={variant.id} value={variant.id}>{product.name} / {variant.specName} / {formatCurrency(variant.price)}</option>)}</select></FormField>
            <TextField label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
            <div className="grid gap-3 sm:grid-cols-2"><TextField label="Flash Price" type="number" value={form.flashPrice} onChange={(value) => setForm((current) => ({ ...current, flashPrice: value }))} /><TextField label="Stock" type="number" value={form.totalStock} onChange={(value) => setForm((current) => ({ ...current, totalStock: value }))} /></div>
            <TextField label="Per User Limit" type="number" value={form.perUserLimit} onChange={(value) => setForm((current) => ({ ...current, perUserLimit: value }))} />
            <div className="grid gap-3 sm:grid-cols-2"><TextField label="Start" type="datetime-local" value={form.startAt} onChange={(value) => setForm((current) => ({ ...current, startAt: value }))} /><TextField label="End" type="datetime-local" value={form.endAt} onChange={(value) => setForm((current) => ({ ...current, endAt: value }))} /></div>
          </FormSection>
          <MutationButton icon={Zap} label="Create flash sale" loadingLabel="Creating..." onClick={create} disabled={createMutation.isPending} />
        </aside>
      </div>
    </>
  );
}

function toLocalInput(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function TextField({ label, onChange, type = "text", value }: Readonly<{ label: string; value: string; type?: string; onChange: (value: string) => void }>) {
  return <FormField label={label} required><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}
