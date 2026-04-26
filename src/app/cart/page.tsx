"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, Plus, Minus, ShieldCheck, Tag, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/lib/cart-store";
import { useProducts } from "@/lib/use-products";
import ProductCard from "@/components/products/ProductCard";
import ProductModal from "@/components/products/ProductModal";
import type { MockProduct } from "@/lib/mock-data";

const DELIVERY_FEE = 5000;
const DISCOUNT_RATE = 0.10;

function shuffleSlice(arr: MockProduct[], n: number): MockProduct[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.slice(0, n);
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function CartPage() {
  const { items, remove, increment, decrement } = useCart();
  const { products } = useProducts();
  const eligible = useMemo(() => products.filter(p => p.price > 2000 && p.stock > 0), [products]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recommended = useMemo(() => shuffleSlice(eligible, 10), [eligible.length]);
  const [voucher, setVoucher] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = discountApplied ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal - discount + (items.length > 0 ? DELIVERY_FEE : 0);

  const handleApplyVoucher = () => {
    if (voucher.trim().toUpperCase() === "ELEVATOR10") setDiscountApplied(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E87B3A] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to shop
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#2C3A48] mb-8">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <Package className="w-9 h-9 text-gray-300" strokeWidth={1} />
              </div>
              <h2 className="text-lg font-semibold text-[#2C3A48] mb-2">Your cart is empty</h2>
              <p className="text-sm text-gray-400 mb-6 max-w-xs">
                Add parts to your cart from the shop to get started.
              </p>
              <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C3A48] text-white text-sm font-semibold rounded-xl hover:bg-[#1e2a35] transition-colors">
                Browse Parts
              </Link>
            </div>
          ) : (
            <>
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* ── Left: product list ── */}
              <div className="flex-1 min-w-0 flex flex-col gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ height: "460px" }}>
                  {/* Table header */}
                  <div className="grid grid-cols-[2fr_1fr_1fr_auto] px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-center">Total</span>
                    <span className="w-8" />
                  </div>

                  {/* Scrollable items */}
                  <div className="overflow-y-auto flex-1">
                    <AnimatePresence initial={false}>
                      {items.map((item, i) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`grid grid-cols-[2fr_1fr_1fr_auto] items-center px-6 py-5 ${i !== 0 ? "border-t border-gray-50" : ""}`}
                        >
                          {/* Product info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              {item.product.image ? (
                                <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-300" strokeWidth={1} />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#2C3A48] truncate">{item.product.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.product.category}</p>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => decrement(item.product.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#E87B3A] hover:text-[#E87B3A] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[#2C3A48]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increment(item.product.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#E87B3A] hover:text-[#E87B3A] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line total */}
                          <p className="text-sm font-bold text-[#2C3A48] text-center">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>

                          {/* Delete */}
                          <button
                            onClick={() => remove(item.product.id)}
                            aria-label="Remove item"
                            className="w-8 flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>

              {/* ── Right: Order summary ── */}
              <div className="w-full lg:w-80 shrink-0">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col" style={{ height: "460px" }}>
                  <h2 className="text-base font-bold text-[#2C3A48] mb-5">Order Summary</h2>

                  {/* Voucher */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={voucher}
                        onChange={(e) => setVoucher(e.target.value)}
                        placeholder="Discount voucher"
                        className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition"
                      />
                    </div>
                    <button
                      onClick={handleApplyVoucher}
                      className="px-3 py-2 text-xs font-semibold bg-[#2C3A48] text-white rounded-lg hover:bg-[#1e2a35] transition-colors whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>

                  {discountApplied && (
                    <p className="text-xs text-green-600 font-medium mb-3">Voucher applied! 10% off.</p>
                  )}

                  {/* Line items */}
                  <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                    <div className="flex justify-between text-gray-500">
                      <span>Sub Total</span>
                      <span className="font-semibold text-[#2C3A48]">{formatPrice(subtotal)}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-gray-500">
                        <span>Discount (10%)</span>
                        <span className="font-semibold text-rose-500">−{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery fee</span>
                      <span className="font-semibold text-[#2C3A48]">{formatPrice(DELIVERY_FEE)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-[#2C3A48]">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Warranty note */}
                  <div className="flex items-start gap-2.5 mt-5 p-3 bg-gray-50 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-[#E87B3A] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      90-day limited warranty against manufacturer&apos;s defects on all parts.{" "}
                      <span className="text-[#E87B3A] font-medium cursor-pointer hover:underline">Details</span>
                    </p>
                  </div>

                  {/* Checkout — pushed to bottom */}
                  <div className="mt-auto">
                    <Link href="/checkout" className="block w-full py-3 bg-[#2C3A48] text-white text-sm font-bold rounded-xl hover:bg-[#1e2a35] transition-colors text-center">
                      Checkout Now
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* ── Recommended Items ── */}
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[#2C3A48]">Recommended Items</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scroll("left")}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scroll("right")}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "none" }}>
                {recommended.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className="min-w-[260px] max-w-[260px]"
                    onClick={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            </div>
            </>
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
