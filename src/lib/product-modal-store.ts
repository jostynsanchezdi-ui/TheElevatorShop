import { create } from "zustand";

interface ProductModalState {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export const useProductModalOpen = create<ProductModalState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
}));
