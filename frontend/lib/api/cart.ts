import { apiClient } from "./client";
import type { Cart } from "@/types";

export async function getCart() {
  const response = await apiClient.get<Cart>("/cart");
  return response.data;
}

export async function addCartItem(payload: { variantId: string; quantity: number }) {
  const response = await apiClient.post<Cart>("/cart/items", payload);
  return response.data;
}

export async function updateCartItem(cartItemId: string, quantity: number) {
  const response = await apiClient.put<Cart>(`/cart/items/${cartItemId}`, { quantity });
  return response.data;
}

export async function removeCartItem(cartItemId: string) {
  const response = await apiClient.delete<Cart>(`/cart/items/${cartItemId}`);
  return response.data;
}
