import { create } from "zustand";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  clear: () => set({ items: [] }),
}));
