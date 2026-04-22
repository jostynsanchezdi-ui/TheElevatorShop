import { create } from "zustand";

type AuthMode = "login" | "register" | null;

interface AuthModalState {
  mode: AuthMode;
  open: (mode: "login" | "register") => void;
  close: () => void;
}

export const useAuthModal = create<AuthModalState>()((set) => ({
  mode: null,
  open: (mode) => set({ mode }),
  close: () => set({ mode: null }),
}));
