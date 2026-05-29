"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackagePlus, Plus, RotateCcw } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { createProduct, getAdminProducts, updateInventory } from "@/lib/api/products";
import { assetUrl } from "@/lib/utils/assetUrl";
import type { CreateProductPayload, Product } from "@/types";

const emptyProduct: CreateProductPayload = {
  name: "",
  description: "",
  category: "",
  imageUrl: "",
  variants: [{ sku: "", specName: "", price: 0, totalStock: 0 }, { sku: "", specName: "", price: 0, totalStock: 0 }],
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CreateProductPayload>(emptyProduct);
  const [inventoryDrafts, setInventoryDrafts] = useState<Record<string, string>>({});
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => getAdminProducts({ search: search || undefined }),
  });
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async () => {
      setForm(emptyProduct);
      toast.success("Product created");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to create product"),
  });
  const inventoryMutation = useMutation({
    mutationFn: ({ productId, variantId, stock }: { productId: string; variantId: string; stock: number }) =>
      updateInventory(productId, { variantId, totalStock: stock, availableStock: stock }),
    onSuccess: async () => {
      toast.success("Inventory updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: () => toast.error("Failed to update inventory"),
  });
  const columns: Column<Product>[] = [
    { key: "name", header: "Product", sortable: true, width: "1.6fr", render: (row) => <div className="flex items-center gap-3">{row.imageUrl ? <img alt="" className="size-11 rounded object-cover" src={assetUrl(row.imageUrl)} /> : null}<div className="min-w-0"><p className="font-medium">{row.name}</p><p className="mt-1 truncate text-xs text-[#666666]">{row.description}</p></div></div> },
    { key: "category", header: "Category", sortable: true, width: "0.8fr", render: (row) => <span className="text-[#A0A0A0]">{row.category}</span> },
    { key: "variants", header: "Variants", width: "1fr", render: (row) => <div className="space-y-1 text-[#A0A0A0]">{row.variants.map((variant) => <p key={variant.id}>{variant.specName}</p>)}</div> },
    { key: "availableStock", header: "Stock", sortable: true, width: "0.7fr", render: (row) => row.variants.reduce((sum, variant) => sum + variant.availableStock, 0) },
    { key: "status", header: "Status", width: "0.7fr", render: (row) => <StatusBadge {...getStatusBadge(row.status)} /> },
  ];

  function updateVariant(index: number, field: keyof CreateProductPayload["variants"][number], value: string) {
    setForm((current) => ({ ...current, variants: current.variants.map((variant, i) => i === index ? { ...variant, [field]: field === "price" || field === "totalStock" ? Number(value) : value } : variant) }));
  }

  return (
    <>
      <PageHeader title="Products" description="Create products, review variants, and adjust inventory." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products" }]} action={{ label: "New Product", icon: Plus, onClick: () => setForm(emptyProduct) }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section>
          <FilterBar searchPlaceholder="Search products..." searchValue={search} onSearchChange={setSearch} />
          <DataTable
            columns={columns}
            data={products}
            emptyMessage="No products found"
            isLoading={isLoading}
            actions={(product) => (
              <div className="grid gap-2">
                {product.variants.map((variant) => (
                  <div className="flex justify-end gap-2" key={variant.id}>
                    <input className="h-8 w-20 rounded-md border border-[#2A2A2A] bg-black px-2 text-right text-sm outline-none" min="0" type="number" value={inventoryDrafts[variant.id] ?? variant.availableStock} onChange={(event) => setInventoryDrafts((current) => ({ ...current, [variant.id]: event.target.value }))} />
                    <button className="inline-flex size-8 items-center justify-center rounded-md border border-[#2A2A2A] hover:bg-[#1E1E1E]" type="button" onClick={() => inventoryMutation.mutate({ productId: product.id, variantId: variant.id, stock: Number(inventoryDrafts[variant.id] ?? variant.availableStock) })}>
                      <RotateCcw className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          />
        </section>
        <aside className="h-fit rounded-md border border-[#2A2A2A] bg-[#141414] p-5 xl:sticky xl:top-8">
          <FormSection title="Create Product" description="Add a catalog item with two initial variants.">
            <FormField label="Name" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></FormField>
            <FormField label="Category" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} /></FormField>
            <FormField label="Description" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></FormField>
            <FormField label="Product image"><MediaPicker value={form.imageUrl} folder="products" onChange={(url) => setForm((current) => ({ ...current, imageUrl: url || null }))} /></FormField>
          </FormSection>
          <FormSection title="Variants">
            {form.variants.map((variant, index) => (
              <div className="mb-4 grid gap-2 rounded-md border border-[#2A2A2A] bg-black p-3 sm:grid-cols-2" key={index}>
                <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="SKU" value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} />
                <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="Spec" value={variant.specName} onChange={(event) => updateVariant(index, "specName", event.target.value)} />
                <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" min="0" placeholder="Price" type="number" value={variant.price} onChange={(event) => updateVariant(index, "price", event.target.value)} />
                <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" min="0" placeholder="Stock" type="number" value={variant.totalStock} onChange={(event) => updateVariant(index, "totalStock", event.target.value)} />
              </div>
            ))}
          </FormSection>
          <MutationButton icon={PackagePlus} label="Create product" loadingLabel="Saving..." onClick={() => createMutation.mutateAsync(form)} disabled={createMutation.isPending} />
        </aside>
      </div>
    </>
  );
}
