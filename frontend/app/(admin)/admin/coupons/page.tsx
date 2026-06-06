"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { createCoupon, deleteCoupon, getAdminCoupons, updateCoupon } from "@/lib/api/coupons";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { Coupon, CouponPayload } from "@/types";

const emptyForm: CouponPayload = { code: "", discountType: "Fixed", discountValue: 100, minOrderAmount: 500, usageLimit: 10, validFrom: "2025-01-01T00:00", validUntil: "2099-12-31T23:59" };

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponPayload>(emptyForm);
  const { data: coupons = [], isLoading } = useQuery({ queryKey: ["admin-coupons"], queryFn: getAdminCoupons });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
  const saveMutation = useMutation({
    mutationFn: (payload: CouponPayload) => editing ? updateCoupon(editing.id, { discountValue: payload.discountValue, minOrderAmount: payload.minOrderAmount, usageLimit: payload.usageLimit, validFrom: payload.validFrom, validUntil: payload.validUntil }) : createCoupon(payload),
    onSuccess: async () => { setEditing(null); setForm(emptyForm); toast.success("Coupon saved"); await invalidate(); },
    onError: () => toast.error("Failed to save coupon"),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: async () => { setDeleteTarget(null); toast.success("Coupon deleted"); await invalidate(); },
    onError: () => toast.error("Failed to delete coupon"),
  });
  const columns: Column<Coupon>[] = [
    { key: "code", header: "Code", sortable: true, width: "1fr", render: (row) => <span className="font-semibold">{row.code}</span> },
    { key: "discountType", header: "Type", width: "110px" },
    { key: "discountValue", header: "Discount", width: "120px", render: (row) => row.discountType === "Percentage" ? `${row.discountValue}%` : formatCurrency(row.discountValue) },
    { key: "minOrderAmount", header: "Min", width: "120px", render: (row) => formatCurrency(row.minOrderAmount) },
    { key: "usedCount", header: "Used", width: "110px", render: (row) => `${row.usedCount}/${row.usageLimit}` },
    { key: "validUntil", header: "Valid Until", sortable: true, width: "140px", render: (row) => new Date(row.validUntil).toLocaleDateString() },
    { key: "status", header: "Status", width: "110px", render: (row) => row.isExpired ? <StatusBadge label="Expired" variant="neutral" /> : row.isFullyUsed ? <StatusBadge label="FullyUsed" variant="danger" /> : <StatusBadge label="Valid" variant="success" /> },
  ];

  function edit(coupon: Coupon) {
    setEditing(coupon);
    setForm({ code: coupon.code, discountType: coupon.discountType === "Percentage" ? "Percentage" : "Fixed", discountValue: coupon.discountValue, minOrderAmount: coupon.minOrderAmount, usageLimit: coupon.usageLimit, validFrom: toLocalInput(coupon.validFrom), validUntil: toLocalInput(coupon.validUntil) });
  }

  function save() {
    return saveMutation.mutateAsync({ ...form, code: form.code.trim().toUpperCase(), discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount), usageLimit: Number(form.usageLimit), validFrom: new Date(form.validFrom).toISOString(), validUntil: new Date(form.validUntil).toISOString() });
  }

  return (
    <>
      <PageHeader title="Coupons" description="Create and manage promotional discounts." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Coupons" }]} action={{ label: "New Coupon", icon: Plus, onClick: () => { setEditing(null); setForm(emptyForm); } }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <DataTable columns={columns} data={coupons} emptyMessage="No coupons found" isLoading={isLoading} actions={(row) => (<><button className="inline-flex size-8 items-center justify-center rounded-md border border-border-default" type="button" onClick={() => edit(row)}><Pencil className="size-4" /></button><button className="inline-flex size-8 items-center justify-center rounded-md border border-border-default text-status-danger" type="button" onClick={() => setDeleteTarget(row)}><Trash2 className="size-4" /></button></>)} />
        <aside className="h-fit rounded-md border border-border-default bg-bg-secondary p-5 xl:sticky xl:top-8">
          <FormSection title={editing ? "Edit Coupon" : "Create Coupon"}>
            <FormField label="Code" required><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none disabled:opacity-60" disabled={!!editing} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></FormField>
            <FormField label="Type" required><select className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none disabled:opacity-60" disabled={!!editing} value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as CouponPayload["discountType"] })}><option value="Fixed">Fixed</option><option value="Percentage">Percentage</option></select></FormField>
            <div className="grid gap-3 sm:grid-cols-2"><NumberField label="Discount" value={form.discountValue} onChange={(value) => setForm({ ...form, discountValue: value })} /><NumberField label="Min Order" value={form.minOrderAmount} onChange={(value) => setForm({ ...form, minOrderAmount: value })} /></div>
            <NumberField label="Usage Limit" value={form.usageLimit} onChange={(value) => setForm({ ...form, usageLimit: value })} />
            <div className="grid gap-3 sm:grid-cols-2"><DateField label="Valid From" value={form.validFrom} onChange={(value) => setForm({ ...form, validFrom: value })} /><DateField label="Valid Until" value={form.validUntil} onChange={(value) => setForm({ ...form, validUntil: value })} /></div>
          </FormSection>
          <MutationButton label="Save coupon" loadingLabel="Saving..." onClick={save} disabled={saveMutation.isPending} />
        </aside>
      </div>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} title="Delete coupon" description={`Delete ${deleteTarget?.code}? This action cannot be undone.`} confirmLabel="Delete" confirmVariant="danger" isLoading={deleteMutation.isPending} />
    </>
  );
}

function toLocalInput(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

function NumberField({ label, onChange, value }: Readonly<{ label: string; value: number; onChange: (value: number) => void }>) {
  return <FormField label={label} required><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" min="0" type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} /></FormField>;
}

function DateField({ label, onChange, value }: Readonly<{ label: string; value: string; onChange: (value: string) => void }>) {
  return <FormField label={label} required><input className="h-10 w-full rounded-md border border-border-default bg-bg-primary px-3 text-sm outline-none" type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} /></FormField>;
}
