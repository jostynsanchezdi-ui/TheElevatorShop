"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Package, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductModal from "@/components/products/ProductModal";
import { useWishlist } from "@/lib/wishlist-store";
import type { MockProduct } from "@/lib/mock-data";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function WishlistPage() {
  const { items, remove } = useWishlist();
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <AnimatePresence>
                {items.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                  >
                    {/* Image */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="relative aspect-square bg-gray-50 w-full"
                    >
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
                          <Package className="w-14 h-14 text-gray-200" strokeWidth={1} />
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-1">
                          {product.category}
                        </p>
                        <h3
                          className="text-sm font-semibold text-[#2C3A48] line-clamp-2 cursor-pointer hover:text-[#E87B3A] transition-colors"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-[#2C3A48]">
                          {formatPrice(product.price)}
                        </span>
                        <button
                          onClick={() => remove(product.id)}
                          aria-label="Remove from wishlist"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1 px-3 py-2 text-xs font-semibold bg-[#2C3A48] text-white rounded-lg hover:bg-[#1e2a35] transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
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
