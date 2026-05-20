"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import ProductModal from "@/components/products/ProductModal";
import { useWishlist } from "@/lib/wishlist-store";
import type { MockProduct } from "@/lib/mock-data";

export default function WishlistPage() {
  const { items } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E87B3A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to shop
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            <h1 className="text-2xl font-bold text-[#2C3A48]">My Wishlist</h1>
            {items.length > 0 && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">
                {items.length}
              </span>
            )}
          </div>

          {/* Empty state */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <Heart className="w-9 h-9 text-gray-300" />
              </div>
              <h2 className="text-lg font-semibold text-[#2C3A48] mb-2">Your wishlist is empty</h2>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Save parts you&apos;re interested in by clicking the heart icon on any product.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3A48] text-white text-sm font-semibold rounded-xl hover:bg-[#1e2a35] transition-colors"
              >
                Browse Parts
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {items.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSelectRelated={(p) => setSelectedProduct(p)}
      />
    </>
  );
}
