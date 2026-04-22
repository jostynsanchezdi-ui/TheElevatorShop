import { create } from "zustand";
import type { MockProduct } from "@/lib/mock-data";

interface WishlistState {
  items: MockProduct[];
  add: (product: MockProduct) => void;
  remove: (id: string) => void;
  toggle: (product: MockProduct) => void;
  has: (id: string) => boolean;
  clear: () => void;
  load: (items: MockProduct[]) => void;
}

export const useWishlist = create<WishlistState>()((set, get) => ({
  items: [],
  add: (product) =>
    set((s) => ({ items: s.items.some((i) => i.id === product.id) ? s.items : [...s.items, product] })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  toggle: (product) => {
    get().has(product.id) ? get().remove(product.id) : get().add(product);
  },
  has: (id) => get().items.some((i) => i.id === id),
  clear: () => set({ items: [] }),
  load: (items) => set({ items }),
}));
