import { create } from "zustand";

interface CategoriesModalState {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

export const useCategoriesModal = create<CategoriesModalState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}));
