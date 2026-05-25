import { create } from "zustand";
import type { MockProduct } from "@/lib/mock-data";

export interface CartItem {
  product: MockProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (product: MockProduct, quantity?: number) => void;
  remove: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  load: (items: CartItem[]) => void;
  has: (id: string) => boolean;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()((set, get) => ({
  items: [],
  add: (product, quantity) =>
    set((s) => {
      const step = product.moq ?? 1;
      const qty = quantity ?? step;
      const existing = s.items.find((i) => i.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        return { items: s.items.map((i) => i.product.id === product.id ? { ...i, quantity: nextQty } : i) };
      }
      return { items: [...s.items, { product, quantity: Math.min(product.stock, qty) }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
  clear: () => set({ items: [] }),
  load: (items) => set({ items }),
  increment: (id) =>
    set((s) => ({
      items: s.items.map((i) => {
        if (i.product.id !== id) return i;
        const step = i.product.moq ?? 1;
        if (i.quantity + step > i.product.stock) return i;
        return { ...i, quantity: i.quantity + step };
      }),
    })),
  decrement: (id) =>
    set((s) => ({
      items: s.items
        .map((i) => {
          if (i.product.id !== id) return i;
          const step = i.product.moq ?? 1;
          return { ...i, quantity: i.quantity - step };
        })
        .filter((i) => i.quantity >= (i.product.moq ?? 1)),
    })),
  setQuantity: (id, quantity) =>
    set((s) => ({
      items: s.items.map((i) => {
        if (i.product.id !== id) return i;
        const step = i.product.moq ?? 1;
        const min = step;
        const max = i.product.stock;
        // Snap to nearest valid step + clamp to [min, max]
        const snapped = Math.max(min, Math.min(max, Math.round(quantity / step) * step));
        return { ...i, quantity: snapped || min };
      }),
    })),
  has: (id) => get().items.some((i) => i.product.id === id),
  total: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
