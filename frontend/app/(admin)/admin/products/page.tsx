"use client";

import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, PackagePlus, Plus, RotateCcw, Save } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { FormField, FormSection } from "@/components/admin/FormSection";
import { MutationButton } from "@/components/admin/MutationButton";
import { PageHeader } from "@/components/admin/PageHeader";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import { StatusBadge, getStatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/admin/Toast";
import { createProduct, getAdminProducts, updateInventory, updateProduct, uploadProductImage } from "@/lib/api/products";
import { assetUrl } from "@/lib/utils/assetUrl";
import type { CreateProductPayload, Product, UpdateProductPayload } from "@/types";

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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<UpdateProductPayload | null>(null);
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
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) => updateProduct(id, payload),
    onSuccess: async (_, variables) => {
      toast.success("Product updated");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
    onError: () => toast.error("Failed to update product"),
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
      <PageHeader title="Products" description="Create products, review variants, and adjust inventory." breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products" }]} action={{ label: "New Product", icon: Plus, onClick: () => { setSelectedProduct(null); setEditForm(null); setForm(emptyProduct); } }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <section>
          <FilterBar searchPlaceholder="Search products..." searchValue={search} onSearchChange={setSearch} />
          <DataTable
            columns={columns}
            data={products}
            emptyMessage="No products found"
            isLoading={isLoading}
            actions={(product) => (
              <div className="grid min-w-36 gap-2">
                <button
                  className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-[#2A2A2A] px-3 text-xs text-white hover:bg-[#1E1E1E]"
                  type="button"
                  onClick={() => {
                    setSelectedProduct(product);
                    setEditForm(toUpdateProductPayload(product));
                  }}
                >
                  <Edit className="size-3.5" />
                  Edit
                </button>
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
          {selectedProduct && editForm ? (
            <EditProductPanel
              form={editForm}
              isSaving={updateMutation.isPending}
              productName={selectedProduct.name}
              onCancel={() => {
                setSelectedProduct(null);
                setEditForm(null);
              }}
              onChange={setEditForm}
              onSave={() => updateMutation.mutateAsync({ id: selectedProduct.id, payload: editForm })}
            />
          ) : (
            <CreateProductPanel
              form={form}
              isSaving={createMutation.isPending}
              onChange={setForm}
              onCreate={() => createMutation.mutateAsync(form)}
              onVariantChange={updateVariant}
            />
          )}
        </aside>
      </div>
    </>
  );
}

function CreateProductPanel({
  form,
  isSaving,
  onChange,
  onCreate,
  onVariantChange,
}: Readonly<{
  form: CreateProductPayload;
  isSaving: boolean;
  onChange: Dispatch<SetStateAction<CreateProductPayload>>;
  onCreate: () => Promise<unknown>;
  onVariantChange: (index: number, field: keyof CreateProductPayload["variants"][number], value: string) => void;
}>) {
  return (
    <>
      <FormSection title="Create Product" description="Add a catalog item with two initial variants.">
        <FormField label="Name" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.name} onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))} /></FormField>
        <FormField label="Category" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.category} onChange={(event) => onChange((current) => ({ ...current, category: event.target.value }))} /></FormField>
        <FormField label="Description" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.description} onChange={(event) => onChange((current) => ({ ...current, description: event.target.value }))} /></FormField>
        <FormField label="Product image" description="Drag a new image here or click the upload area.">
          <ProductImageManager
            currentImageUrl={form.imageUrl}
            disabled={isSaving}
            onRemove={() => onChange((current) => ({ ...current, imageUrl: null }))}
            onUpload={async (file) => {
              const media = await uploadProductImage(file);
              onChange((current) => ({ ...current, imageUrl: media.filePath }));
              return media.filePath;
            }}
          />
        </FormField>
      </FormSection>
      <FormSection title="Variants">
        {form.variants.map((variant, index) => (
          <div className="mb-4 grid gap-2 rounded-md border border-[#2A2A2A] bg-black p-3 sm:grid-cols-2" key={index}>
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="SKU" value={variant.sku} onChange={(event) => onVariantChange(index, "sku", event.target.value)} />
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="Spec" value={variant.specName} onChange={(event) => onVariantChange(index, "specName", event.target.value)} />
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" min="0" placeholder="Price" type="number" value={variant.price} onChange={(event) => onVariantChange(index, "price", event.target.value)} />
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" min="0" placeholder="Stock" type="number" value={variant.totalStock} onChange={(event) => onVariantChange(index, "totalStock", event.target.value)} />
          </div>
        ))}
      </FormSection>
      <MutationButton disabled={isSaving} icon={PackagePlus} label="Create product" loadingLabel="Saving..." onClick={onCreate} />
    </>
  );
}

function EditProductPanel({
  form,
  isSaving,
  onCancel,
  onChange,
  onSave,
  productName,
}: Readonly<{
  form: UpdateProductPayload;
  isSaving: boolean;
  productName: string;
  onCancel: () => void;
  onChange: Dispatch<SetStateAction<UpdateProductPayload | null>>;
  onSave: () => Promise<unknown>;
}>) {
  return (
    <>
      <FormSection title="Edit Product" description={`Update catalog details and image for ${productName}.`}>
        <FormField label="Name" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.name} onChange={(event) => onChange((current) => current ? { ...current, name: event.target.value } : current)} /></FormField>
        <FormField label="Category" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.category} onChange={(event) => onChange((current) => current ? { ...current, category: event.target.value } : current)} /></FormField>
        <FormField label="Description" required><input className="h-10 w-full rounded-md border border-[#2A2A2A] bg-black px-3 text-sm outline-none" value={form.description} onChange={(event) => onChange((current) => current ? { ...current, description: event.target.value } : current)} /></FormField>
        <FormField label="Product image" description="Drop a replacement image here. Save to publish the change.">
          <ProductImageManager
            currentImageUrl={form.imageUrl}
            disabled={isSaving}
            onRemove={() => onChange((current) => current ? { ...current, imageUrl: null } : current)}
            onUpload={async (file) => {
              const media = await uploadProductImage(file);
              onChange((current) => current ? { ...current, imageUrl: media.filePath } : current);
              return media.filePath;
            }}
          />
        </FormField>
      </FormSection>
      <FormSection title="Variants" description="Variant stock is managed from the table actions.">
        {form.variants.map((variant, index) => (
          <div className="mb-4 grid gap-2 rounded-md border border-[#2A2A2A] bg-black p-3 sm:grid-cols-2" key={variant.id ?? index}>
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="SKU" value={variant.sku} onChange={(event) => updateEditVariant(onChange, index, "sku", event.target.value)} />
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" placeholder="Spec" value={variant.specName} onChange={(event) => updateEditVariant(onChange, index, "specName", event.target.value)} />
            <input className="h-9 rounded-md border border-[#2A2A2A] bg-[#141414] px-3 text-sm outline-none" min="0" placeholder="Price" type="number" value={variant.price} onChange={(event) => updateEditVariant(onChange, index, "price", event.target.value)} />
          </div>
        ))}
      </FormSection>
      <div className="flex flex-wrap gap-2">
        <MutationButton disabled={isSaving} icon={Save} label="Save changes" loadingLabel="Saving..." onClick={onSave} />
        <button className="inline-flex h-10 items-center justify-center rounded-md border border-[#2A2A2A] px-4 text-sm text-white hover:bg-[#1E1E1E]" disabled={isSaving} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </>
  );
}

function updateEditVariant(
  onChange: Dispatch<SetStateAction<UpdateProductPayload | null>>,
  index: number,
  field: keyof UpdateProductPayload["variants"][number],
  value: string,
) {
  onChange((current) => {
    if (!current) return current;
    return {
      ...current,
      variants: current.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [field]: field === "price" ? Number(value) : value } : variant),
    };
  });
}

function toUpdateProductPayload(product: Product): UpdateProductPayload {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrl: product.imageUrl ?? null,
    status: product.status || "Active",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      specName: variant.specName,
      price: variant.price,
      status: "Active",
    })),
  };
}
