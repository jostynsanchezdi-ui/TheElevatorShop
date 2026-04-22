import { create } from "zustand";

interface ContactModalState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useContactModal = create<ContactModalState>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
