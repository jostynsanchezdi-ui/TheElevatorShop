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

let cache: MockProduct[] | null = null;

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<MockProduct[]>(cache ?? MOCK_PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cache) { setProducts(cache); return; }
    fetch("/api/zoho/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          cache = data;
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
