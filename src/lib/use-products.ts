"use client";

import { useState, useEffect } from "react";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import type { MockProduct } from "@/lib/mock-data";
import type { SidebarCategory } from "@/components/layout/ShopSidebar";

interface UseProductsResult {
  products: MockProduct[];
  categories: SidebarCategory[];
  loading: boolean;
}

const g = globalThis as typeof globalThis & { __productsCache?: MockProduct[] };

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<MockProduct[]>(g.__productsCache ?? MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (g.__productsCache) { setProducts(g.__productsCache); return; }
    fetch("/api/zoho/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          g.__productsCache = data;
          setProducts(data);
        }
      })
      .catch(() => {});
  }, []);

  // Build sidebar: category → subcategories
  const categoryMap = new Map<string, Set<string>>();
  for (const p of products) {
    if (!categoryMap.has(p.category)) categoryMap.set(p.category, new Set());
    if (p.subcategory) categoryMap.get(p.category)!.add(p.subcategory);
  }

  const categories: SidebarCategory[] = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cat, subs]) => ({
      id: cat,
      label: cat,
      subcategories: Array.from(subs)
        .sort()
        .map((s) => ({ id: s, label: s })),
    }));

  return { products, categories, loading };
}
