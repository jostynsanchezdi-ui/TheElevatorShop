import { create } from "zustand";
import type { MockProduct } from "@/lib/mock-data";

export interface CartItem {
  product: MockProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: MockProduct) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  load: (items: CartItem[]) => void;
  has: (id: string) => boolean;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  add: (product) =>
    set((s) => {
      const existing = s.items.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return s;
        return { items: s.items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...s.items, { product, quantity: 1 }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
  clear: () => set({ items: [] }),
  load: (items) => set({ items }),
  increment: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.product.id === id && i.quantity < i.product.stock
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ),
    })),
  decrement: (id) =>
    set((s) => ({
      items: s.items
        .map((i) => i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter((i) => i.quantity > 0),
    })),
  has: (id) => get().items.some((i) => i.product.id === id),
  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
