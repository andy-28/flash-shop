import { create } from "zustand";
import axios from "axios";
import { addCartItem, getCart, removeCartItem, updateCartItem } from "@/lib/api/cart";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isLoading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  totalAmount: 0,
  itemCount: 0,
  isLoading: false,
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  fetchCart: async () => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const cart = await getCart();
      set({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        set({ items: [], totalAmount: 0, itemCount: 0 });
        return;
      }

      console.error("Failed to fetch cart", error);
    } finally {
      set({ isLoading: false });
    }
  },
  addToCart: async (variantId, quantity) => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const cart = await addCartItem({ variantId, quantity });
      set({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount, isOpen: true });
    } catch (error) {
      console.error("Failed to add cart item", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  updateQuantity: async (cartItemId, quantity) => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const cart = await updateCartItem(cartItemId, quantity);
      set({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount });
    } catch (error) {
      console.error("Failed to update cart item", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  removeItem: async (cartItemId) => {
    if (get().isLoading) return;
    set({ isLoading: true });
    try {
      const cart = await removeCartItem(cartItemId);
      set({ items: cart.items, totalAmount: cart.totalAmount, itemCount: cart.itemCount });
    } catch (error) {
      console.error("Failed to remove cart item", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  clearCart: () => set({ items: [], totalAmount: 0, itemCount: 0 }),
}));
