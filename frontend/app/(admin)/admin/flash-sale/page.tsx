"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, Play, Square } from "lucide-react";
import { activateFlashSale, createFlashSale, endFlashSale, getAdminFlashSales } from "@/lib/api/flashSale";
import { getAdminProducts } from "@/lib/api/products";
import type { FlashSalePayload } from "@/types";

function toLocalInput(value: Date) {
  const offset = value.getTimezoneOffset();
  return new Date(value.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function money(value: number) {
  return `NT$ ${value.toLocaleString()}`;
}

const initialForm = {
  variantId: "",
  title: "",
  flashPrice: "99",
  totalStock: "10",
  perUserLimit: "1",
  startAt: toLocalInput(new Date()),
  endAt: toLocalInput(new Date(Date.now() + 60 * 60 * 1000)),
};

export default function AdminFlashSalePage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const { data: sales = [], isLoading } = useQuery({ queryKey: ["admin-flash-sales"], queryFn: getAdminFlashSales });
  const { data: products = [] } = useQuery({ queryKey: ["admin-products-for-flash-sale"], queryFn: () => getAdminProducts() });
  const variants = useMemo(
    () => products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))),
    [products],
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-flash-sales"] });
  };

  const createMutation = useMutation({
    mutationFn: createFlashSale,
    onSuccess: async () => {
      setForm(initialForm);
      await refresh();
    },
  });
  const activateMutation = useMutation({ mutationFn: activateFlashSale, onSuccess: refresh });
  const endMutation = useMutation({ mutationFn: endFlashSale, onSuccess: refresh });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: FlashSalePayload = {
      variantId: form.variantId,
      title: form.title,
      flashPrice: Number(form.flashPrice),
      totalStock: Number(form.totalStock),
      perUserLimit: Number(form.perUserLimit),
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-zinc-500">Commerce</p>
          <h1 className="mt-2 text-3xl font-semibold">Flash Sale</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-[#141414] px-3 py-2 text-sm text-zinc-300">
          <Flame className="size-4 text-[#EF4444]" />
          Redis pre-deduction
        </div>
      </div>

      <form className="grid gap-4 rounded-md border border-white/10 bg-[#141414] p-5 lg:grid-cols-2" onSubmit={submit}>
        <label className="grid gap-2 text-sm">
          Variant
          <select
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            value={form.variantId}
            onChange={(event) => setForm((value) => ({ ...value, variantId: event.target.value }))}
            required
          >
            <option value="">Select variant</option>
            {variants.map(({ product, variant }) => (
              <option key={variant.id} value={variant.id}>
                {product.name} / {variant.specName} / {money(variant.price)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Title
          <input
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            value={form.title}
            onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          Flash price
          <input
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            type="number"
            min="1"
            value={form.flashPrice}
            onChange={(event) => setForm((value) => ({ ...value, flashPrice: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Stock
          <input
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            type="number"
            min="1"
            value={form.totalStock}
            onChange={(event) => setForm((value) => ({ ...value, totalStock: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Start
          <input
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((value) => ({ ...value, startAt: event.target.value }))}
          />
        </label>
        <label className="grid gap-2 text-sm">
          End
          <input
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm"
            type="datetime-local"
            value={form.endAt}
            onChange={(event) => setForm((value) => ({ ...value, endAt: event.target.value }))}
          />
        </label>
        <button
          type="submit"
          className="h-10 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-40 lg:col-span-2"
          disabled={createMutation.isPending}
        >
          Create flash sale
        </button>
      </form>

      <div className="overflow-hidden rounded-md border border-white/10 bg-[#141414]">
        <div className="grid grid-cols-[1fr_120px_120px_120px_180px] border-b border-white/10 bg-[#1E1E1E] px-4 py-3 text-xs font-medium uppercase text-zinc-500">
          <span>Sale</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {isLoading ? <p className="p-4 text-sm text-zinc-400">Loading flash sales...</p> : null}
        {sales.map((sale) => (
          <div className="grid grid-cols-[1fr_120px_120px_120px_180px] items-center px-4 py-4 text-sm" key={sale.id}>
            <div>
              <p className="font-medium">{sale.title}</p>
              <p className="text-xs text-zinc-500">{sale.productName} / {sale.specName}</p>
            </div>
            <span>{money(sale.flashPrice)}</span>
            <span>{sale.soldCount}/{sale.totalStock}</span>
            <span className="w-fit rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-300">{sale.status}</span>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-zinc-300 disabled:opacity-40"
                disabled={sale.status === "Active" || activateMutation.isPending}
                onClick={() => activateMutation.mutate(sale.id)}
                aria-label="Activate"
              >
                <Play className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 text-zinc-300 disabled:opacity-40"
                disabled={sale.status !== "Active" || endMutation.isPending}
                onClick={() => endMutation.mutate(sale.id)}
                aria-label="End"
              >
                <Square className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
