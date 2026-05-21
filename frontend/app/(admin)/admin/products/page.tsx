"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, RotateCcw, Save, Search } from "lucide-react";
import { createProduct, getAdminProducts, updateInventory } from "@/lib/api/products";
import type { CreateProductPayload } from "@/types";

const emptyProduct: CreateProductPayload = {
  name: "",
  description: "",
  category: "",
  variants: [
    { sku: "", specName: "", price: 0, totalStock: 0 },
    { sku: "", specName: "", price: 0, totalStock: 0 },
  ],
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CreateProductPayload>(emptyProduct);
  const [inventoryDrafts, setInventoryDrafts] = useState<Record<string, string>>({});

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => getAdminProducts({ search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setForm(emptyProduct);
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const inventoryMutation = useMutation({
    mutationFn: ({ productId, variantId, stock }: { productId: string; variantId: string; stock: number }) =>
      updateInventory(productId, { variantId, totalStock: stock, availableStock: stock }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  function updateVariant(index: number, field: keyof CreateProductPayload["variants"][number], value: string) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: field === "price" || field === "totalStock" ? Number(value) : value,
            }
          : variant,
      ),
    }));
  }

  function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium uppercase text-zinc-500">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold">Products</h1>
        </div>
      </div>

      <form onSubmit={submitProduct} className="rounded-md border border-white/10 bg-zinc-950 p-4">
        <div className="mb-4 flex items-center gap-2">
          <PackagePlus className="size-4 text-emerald-300" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Create product</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-emerald-300"
            placeholder="Product name"
          />
          <input
            required
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-emerald-300"
            placeholder="Category"
          />
          <input
            required
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            className="h-10 rounded-md border border-white/10 bg-black px-3 text-sm outline-none focus:border-emerald-300"
            placeholder="Description"
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {form.variants.map((variant, index) => (
            <div key={index} className="rounded-md border border-white/10 bg-black p-3">
              <p className="mb-3 text-xs font-medium uppercase text-zinc-500">Variant {index + 1}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  required
                  value={variant.sku}
                  onChange={(event) => updateVariant(index, "sku", event.target.value)}
                  className="h-9 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="SKU"
                />
                <input
                  required
                  value={variant.specName}
                  onChange={(event) => updateVariant(index, "specName", event.target.value)}
                  className="h-9 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="Spec"
                />
                <input
                  required
                  min="0"
                  type="number"
                  value={variant.price}
                  onChange={(event) => updateVariant(index, "price", event.target.value)}
                  className="h-9 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="Price"
                />
                <input
                  required
                  min="0"
                  type="number"
                  value={variant.totalStock}
                  onChange={(event) => updateVariant(index, "totalStock", event.target.value)}
                  className="h-9 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm outline-none focus:border-emerald-300"
                  placeholder="Stock"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-md bg-emerald-300 px-3 text-sm font-medium text-black disabled:opacity-50"
          disabled={createMutation.isPending}
        >
          <Save className="size-4" />
          {createMutation.isPending ? "Saving" : "Create product"}
        </button>
      </form>

      <label className="flex h-10 max-w-md items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3">
        <Search className="size-4 text-zinc-500" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-600"
          placeholder="Search products"
        />
      </label>

      <div className="overflow-hidden rounded-md border border-white/10 bg-zinc-950">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-medium uppercase text-zinc-500">
          <span>Product</span>
          <span>Variants</span>
          <span>Stock</span>
          <span className="text-right">Inventory</span>
        </div>
        {isLoading ? (
          <div className="px-4 py-5 text-sm text-zinc-400">Loading products...</div>
        ) : (
          products.map((product) => (
            <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3 border-b border-white/10 px-4 py-4 text-sm last:border-b-0" key={product.id}>
              <div>
                <p className="font-medium text-white">{product.name}</p>
                <p className="mt-1 text-xs text-zinc-500">{product.category}</p>
              </div>
              <div className="space-y-1 text-zinc-300">
                {product.variants.map((variant) => (
                  <p key={variant.id}>{variant.specName}</p>
                ))}
              </div>
              <div className="space-y-1 text-zinc-300">
                {product.variants.map((variant) => (
                  <p key={variant.id}>{variant.availableStock}</p>
                ))}
              </div>
              <div className="space-y-2">
                {product.variants.map((variant) => (
                  <div className="flex justify-end gap-2" key={variant.id}>
                    <input
                      type="number"
                      min="0"
                      value={inventoryDrafts[variant.id] ?? variant.availableStock}
                      onChange={(event) =>
                        setInventoryDrafts((current) => ({ ...current, [variant.id]: event.target.value }))
                      }
                      className="h-8 w-20 rounded-md border border-white/10 bg-black px-2 text-right text-sm outline-none focus:border-emerald-300"
                    />
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded-md border border-white/10 hover:bg-white/10"
                      onClick={() =>
                        inventoryMutation.mutate({
                          productId: product.id,
                          variantId: variant.id,
                          stock: Number(inventoryDrafts[variant.id] ?? variant.availableStock),
                        })
                      }
                    >
                      <RotateCcw className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
