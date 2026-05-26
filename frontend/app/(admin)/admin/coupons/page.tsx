"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createCoupon, deleteCoupon, getAdminCoupons, updateCoupon } from "@/lib/api/coupons";
import type { Coupon, CouponPayload } from "@/types";

const emptyForm: CouponPayload = {
  code: "",
  discountType: "Fixed",
  discountValue: 100,
  minOrderAmount: 500,
  usageLimit: 10,
  validFrom: "2025-01-01T00:00",
  validUntil: "2099-12-31T23:59",
};

function statusOf(coupon: Coupon) {
  if (coupon.isExpired) {
    return { label: "已過期", className: "bg-zinc-500/15 text-zinc-400" };
  }

  if (coupon.isFullyUsed) {
    return { label: "已用完", className: "bg-[#EF4444]/15 text-[#EF4444]" };
  }

  return { label: "有效", className: "bg-[#22C55E]/15 text-[#22C55E]" };
}

function toLocalInput(value: string) {
  return new Date(value).toISOString().slice(0, 16);
}

function normalizePayload(payload: CouponPayload): CouponPayload {
  return {
    ...payload,
    code: payload.code.trim().toUpperCase(),
    discountValue: Number(payload.discountValue),
    minOrderAmount: Number(payload.minOrderAmount),
    usageLimit: Number(payload.usageLimit),
    validFrom: new Date(payload.validFrom).toISOString(),
    validUntil: new Date(payload.validUntil).toISOString(),
  };
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponPayload>(emptyForm);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: getAdminCoupons,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });

  const saveMutation = useMutation({
    mutationFn: (payload: CouponPayload) =>
      editing
        ? updateCoupon(editing.id, {
            discountValue: payload.discountValue,
            minOrderAmount: payload.minOrderAmount,
            usageLimit: payload.usageLimit,
            validFrom: payload.validFrom,
            validUntil: payload.validUntil,
          })
        : createCoupon(payload),
    onSuccess: () => {
      setEditing(null);
      setForm(emptyForm);
      void invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => void invalidate(),
  });

  function edit(coupon: Coupon) {
    setEditing(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType === "Percentage" ? "Percentage" : "Fixed",
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      usageLimit: coupon.usageLimit,
      validFrom: toLocalInput(coupon.validFrom),
      validUntil: toLocalInput(coupon.validUntil),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveMutation.mutate(normalizePayload(form));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium uppercase text-zinc-500">Commerce</p>
            <h1 className="mt-2 text-3xl font-semibold">優惠券管理</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-black"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
            }}
          >
            <Plus className="size-4" />
            新增優惠券
          </button>
        </div>

        <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
          <div className="grid grid-cols-[1fr_110px_110px_120px_120px_170px_90px_88px] border-b border-white/10 bg-[#1E1E1E] px-4 py-3 text-xs font-medium uppercase text-zinc-500">
            <span>Code</span>
            <span>類型</span>
            <span>折扣</span>
            <span>最低消費</span>
            <span>已用/上限</span>
            <span>有效期間</span>
            <span>狀態</span>
            <span className="text-right">操作</span>
          </div>
          {isLoading ? <p className="p-4 text-sm text-zinc-400">Loading coupons...</p> : null}
          {!isLoading && coupons.length === 0 ? <p className="p-4 text-sm text-zinc-400">尚未建立優惠券。</p> : null}
          {coupons.map((coupon) => {
            const status = statusOf(coupon);
            return (
              <div className="grid grid-cols-[1fr_110px_110px_120px_120px_170px_90px_88px] items-center border-b border-white/10 px-4 py-4 text-sm last:border-b-0" key={coupon.id}>
                <span className="font-semibold">{coupon.code}</span>
                <span className="text-zinc-300">{coupon.discountType}</span>
                <span>{coupon.discountType === "Percentage" ? `${coupon.discountValue}%` : `NT$ ${coupon.discountValue.toLocaleString()}`}</span>
                <span>NT$ {coupon.minOrderAmount.toLocaleString()}</span>
                <span>{coupon.usedCount}/{coupon.usageLimit}</span>
                <span className="text-xs text-zinc-400">
                  {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validUntil).toLocaleDateString()}
                </span>
                <span className={`w-fit rounded-full px-2 py-1 text-xs ${status.className}`}>{status.label}</span>
                <span className="flex justify-end gap-2">
                  <button type="button" className="inline-flex size-8 items-center justify-center rounded-md border border-white/10" onClick={() => edit(coupon)}>
                    <Pencil className="size-4" />
                  </button>
                  <button type="button" className="inline-flex size-8 items-center justify-center rounded-md border border-white/10 text-[#EF4444]" onClick={() => deleteMutation.mutate(coupon.id)}>
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <aside className="h-fit rounded-md border border-white/10 bg-[#141414] p-5 xl:sticky xl:top-20">
        <h2 className="text-lg font-semibold">{editing ? "編輯優惠券" : "新增優惠券"}</h2>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input required disabled={!!editing} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white disabled:opacity-60" placeholder="SAVE100" />
          <select disabled={!!editing} value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as CouponPayload["discountType"] })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white disabled:opacity-60">
            <option value="Fixed">Fixed</option>
            <option value="Percentage">Percentage</option>
          </select>
          <input required min="1" type="number" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Discount value" />
          <input required min="0" type="number" value={form.minOrderAmount} onChange={(event) => setForm({ ...form, minOrderAmount: Number(event.target.value) })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Min order amount" />
          <input required min="1" type="number" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })} className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" placeholder="Usage limit" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input required type="datetime-local" value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" />
            <input required type="datetime-local" value={form.validUntil} onChange={(event) => setForm({ ...form, validUntil: event.target.value })} className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-white" />
          </div>
          {saveMutation.isError ? <p className="text-sm text-[#EF4444]">儲存失敗，請檢查欄位。</p> : null}
          <button className="h-10 w-full rounded-md bg-white text-sm font-medium text-black disabled:opacity-50" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "儲存優惠券"}
          </button>
        </form>
      </aside>
    </div>
  );
}
