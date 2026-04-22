"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import type { CartItem } from "@/lib/cart-store";
import type { MockProduct } from "@/lib/mock-data";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuth((s) => s.setUser);
  const loadCart = useCart((s) => s.load);
  const clearCart = useCart((s) => s.clear);
  const loadWishlist = useWishlist((s) => s.load);
  const clearWishlist = useWishlist((s) => s.clear);

  // Track previous user id to detect user changes
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  // Sync cart & wishlist with per-user localStorage
  const user = useAuth((s) => s.user);
  useEffect(() => {
    const userId = user?.id ?? null;

    if (userId && userId !== prevUserIdRef.current) {
      // Signed in — load saved cart & wishlist for this user
      try {
        const savedCart = localStorage.getItem(`tes-cart-${userId}`);
        if (savedCart) loadCart(JSON.parse(savedCart) as CartItem[]);
      } catch { /* ignore */ }
      try {
        const savedWishlist = localStorage.getItem(`tes-wishlist-${userId}`);
        if (savedWishlist) loadWishlist(JSON.parse(savedWishlist) as MockProduct[]);
      } catch { /* ignore */ }
    } else if (!userId && prevUserIdRef.current) {
      // Signed out — clear stores
      clearCart();
      clearWishlist();
    }

    prevUserIdRef.current = userId;
  }, [user, loadCart, clearCart, loadWishlist, clearWishlist]);

  // Auto-save cart & wishlist to localStorage while signed in
  useEffect(() => {
    if (!user) return;
    const unsub = useCart.subscribe((state) => {
      localStorage.setItem(`tes-cart-${user.id}`, JSON.stringify(state.items));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = useWishlist.subscribe((state) => {
      localStorage.setItem(`tes-wishlist-${user.id}`, JSON.stringify(state.items));
    });
    return unsub;
  }, [user]);

  return <>{children}</>;
}
