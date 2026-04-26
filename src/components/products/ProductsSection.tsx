"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Search, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import ShopSidebar from "@/components/layout/ShopSidebar";
import { useProducts } from "@/lib/use-products";
import type { MockProduct } from "@/lib/mock-data";

const PAGE_SIZE = 6;
const MAX_SUGGESTIONS = 6;

export default function ProductsSection() {
  const { products, categories } = useProducts();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [search, products]);

  const filtered = useMemo(() => {
    if (category === "all") return products.filter((p) => p.price > 2000);

    const matches = products.filter(
      (p) =>
        p.category === category ||
        p.subcategory === category ||
        p.category.toLowerCase() === category.toLowerCase() ||
        p.subcategory?.toLowerCase() === category.toLowerCase()
    );

    return [
      ...matches.filter((p) => p.stock > 0).sort((a, b) => b.price - a.price),
      ...matches.filter((p) => p.stock <= 0),
    ];
  }, [category, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleCategory = (id: string) => {
    setCategory(id);
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setDropdownOpen(true);
  };

  const handleSelectSuggestion = (product: MockProduct) => {
    setSearch("");
    setDropdownOpen(false);
    setSelectedProduct(product);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <ShopSidebar selected={category} onSelect={handleCategory} categories={categories} />

        {/* Grid + pagination */}
        <div className="flex-1 min-w-0">

          {/* Search bar */}
          <div ref={searchRef} className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              onFocus={() => search.trim() && setDropdownOpen(true)}
              placeholder="Search by name…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {dropdownOpen && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
                >
                  {suggestions.map((product, i) => (
                    <button
                      key={product.id}
                      onClick={() => handleSelectSuggestion(product)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 transition-colors group ${
                        i !== 0 ? "border-t border-gray-50" : ""
                      }`}
                    >
                      {/* Product image */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2C3A48] truncate group-hover:text-[#E87B3A] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {product.category}
                        </p>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-bold text-gray-700 shrink-0">
                        ${(product.price / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* No results state */}
              {dropdownOpen && search.trim() && suggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 px-4 py-6 text-center"
                >
                  <p className="text-sm text-gray-400">No parts found for &ldquo;{search}&rdquo;</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {pageItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No parts found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pageItems.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                const start = Math.min(currentPage - 1, totalPages - 4);
                return Math.max(1, start) + i;
              }).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === p
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product detail modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />
    </section>
  );
}
