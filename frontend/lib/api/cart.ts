import { apiClient } from "./client";
import type { CartItem } from "@/types";

export async function getCart() {
  const response = await apiClient.get<CartItem[]>("/cart");
  return response.data;
}

export async function addCartItem(variantId: string, quantity: number) {
  const response = await apiClient.post("/cart/items", { variantId, quantity });
  return response.data;
}
