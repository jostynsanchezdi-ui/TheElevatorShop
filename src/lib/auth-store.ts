"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
  signedOut: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  signedOut: false,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, signedOut: true });
    setTimeout(() => set({ signedOut: false }), 2500);
  },
}));
