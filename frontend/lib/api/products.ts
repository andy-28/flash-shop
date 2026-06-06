import { apiClient } from "./client";
import { uploadMedia } from "./media";
import type { CreateProductPayload, Product, UpdateInventoryPayload, UpdateProductPayload } from "@/types";

export async function getProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}) {
  const response = await apiClient.get<Product[]>("/products", { params });
  return response.data;
}

export async function getProduct(id: string) {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

export async function getAdminProducts(params?: { search?: string; category?: string }) {
  const response = await apiClient.get<Product[]>("/admin/products", { params });
  return response.data;
}

export async function createProduct(payload: CreateProductPayload) {
  const response = await apiClient.post<{ id: string }>("/admin/products", payload);
  return response.data;
}

export async function updateProduct(productId: string, payload: UpdateProductPayload) {
  await apiClient.put(`/admin/products/${productId}`, payload);
}

export async function uploadProductImage(file: File) {
  return uploadMedia(file, "products");
}

export async function updateProductImageUrl(product: Product, imageUrl: string | null) {
  await updateProduct(product.id, toUpdateProductPayload(product, imageUrl));
}

export async function deleteProductImage(product: Product) {
  await updateProductImageUrl(product, null);
}

export async function setPrimaryProductImage(product: Product, imageUrl: string) {
  await updateProductImageUrl(product, imageUrl);
}

export async function updateInventory(productId: string, payload: UpdateInventoryPayload) {
  const response = await apiClient.put(`/admin/products/${productId}/inventory`, payload);
  return response.data;
}

export async function markVariantArrival(variantId: string, arrivalStock: number) {
  const response = await apiClient.post<{ notifiedOrders: number }>(`/admin/products/variants/${variantId}/mark-arrival`, { arrivalStock });
  return response.data;
}

function toUpdateProductPayload(product: Product, imageUrl: string | null): UpdateProductPayload {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrl,
    status: product.status || "Active",
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      specName: variant.specName,
      price: variant.price,
      status: "Active",
      isPreOrder: variant.isPreOrder,
      estimatedArrivalDate: variant.estimatedArrivalDate,
    })),
  };
}
