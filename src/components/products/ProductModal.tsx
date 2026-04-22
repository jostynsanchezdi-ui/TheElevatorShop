"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { X, Heart, ShoppingCart, Package } from "lucide-react";
import type { MockProduct } from "@/lib/mock-data";
import { useProducts } from "@/lib/use-products";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";

const COLOR_OPTIONS = [
  { hex: "#E87B3A", label: "Orange" },
  { hex: "#2C3A48", label: "Navy" },
  { hex: "#6b7280", label: "Gray" },
  { hex: "#22c55e", label: "Green" },
  { hex: "#3b82f6", label: "Blue" },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  const dollars = cents / 100;
  return `$ ${dollars.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


// ─── ColorSelector ────────────────────────────────────────────────────────────

interface ColorSelectorProps {
  selected: string;
  onChange: (hex: string) => void;
}

function ColorSelector({ selected, onChange }: ColorSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      {COLOR_OPTIONS.map(({ hex, label }) => (
        <button
          key={hex}
          aria-label={`Select finish: ${label}`}
          onClick={() => onChange(hex)}
          className={clsx(
            "relative w-7 h-7 rounded-full border-2 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#E87B3A]",
            selected === hex
              ? "border-[#2C3A48] scale-110"
              : "border-transparent hover:scale-105"
          )}
          style={{ backgroundColor: hex }}
        >
          {selected === hex && (
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-3.5 h-0.5 rounded-full bg-[#2C3A48]" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── RelatedTile ──────────────────────────────────────────────────────────────

interface RelatedTileProps {
  product: MockProduct;
  onSelect: (product: MockProduct) => void;
}

function RelatedTile({ product, onSelect }: RelatedTileProps) {
  return (
    <button
      onClick={() => onSelect(product)}
      className="flex-shrink-0 w-28 flex flex-col gap-1.5 text-left hover:opacity-75 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87B3A] rounded-xl"
      aria-label={`View ${product.name}`}
    >
      <div className="relative w-28 h-20 bg-white rounded-xl overflow-hidden border border-gray-100">
        {product.image ? (
          <div className="absolute inset-[12.5%]">
            <Image src={product.image} alt={product.name} fill className="object-contain" unoptimized />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" strokeWidth={1} />
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-[#2C3A48] leading-tight line-clamp-2">
        {product.name}
      </p>
      <p className="text-xs font-bold text-gray-600">
        {formatPrice(product.price)}
      </p>
    </button>
  );
}

// ─── ModalInner (owns color state so it resets on each product) ───────────────

interface ModalInnerProps {
  product: MockProduct;
  onClose: () => void;
  onSelectRelated: (product: MockProduct) => void;
}

function ModalInner({ product, onClose, onSelectRelated }: ModalInnerProps) {
  const { products } = useProducts();
  const { toggle, has } = useWishlist();
  const wishlisted = has(product.id);
  const { add: addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAdded(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 400);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = useMemo(() => {
    const pool = products.filter((p) => p.id !== product.id && p.category === product.category);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id, products]);

  return (
    <div
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Wishlist button */}
      <button
        onClick={() => toggle(product)}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="absolute top-4 right-14 z-10 p-1.5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 hover:bg-rose-50"
      >
        <Heart
          className={clsx(
            "w-5 h-5 transition-colors",
            wishlisted ? "text-rose-500 fill-rose-500" : "text-gray-400 hover:text-rose-400"
          )}
        />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close product detail"
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87B3A]"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="flex flex-col sm:flex-row gap-6 p-6">
        {/* ── Left: image + thumbnails ── */}
        <div className="flex flex-col gap-3 sm:w-52 shrink-0">
          {/* Main image */}
          <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden border border-gray-100">
            {product.image ? (
              <div className={clsx("absolute inset-[12.5%] transition-all duration-300", added && "blur-sm scale-105")}>
                <Image src={product.image} alt={product.name} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className={clsx("w-full h-full flex items-center justify-center transition-all duration-300", added && "blur-sm")}>
                <Package className="w-24 h-24 text-gray-200" strokeWidth={1} />
              </div>
            )}
            <AnimatePresence>
              {added && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/10"
                >
                  <motion.svg width="64" height="64" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
                    <motion.circle cx="28" cy="28" r="24" stroke="white" strokeWidth="2.5" fill="rgba(40,167,69,0.85)"
                      initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.45, ease: "easeOut" }} strokeLinecap="round" />
                    <motion.path d="M17 28.5L24.5 36L39 21" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }} />
                  </motion.svg>
                  <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.2 }}
                    className="mt-2 text-xs font-semibold text-white drop-shadow text-center leading-tight">
                    Added to Cart<br />Successfully
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* ── Right: details ── */}
        <div className="flex-1 flex flex-col gap-3.5 min-w-0">
          {/* SKU */}
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
            SKU: {product.sku} &nbsp;·&nbsp; {product.category}
          </p>

          {/* Name */}
          <h2 className="text-2xl font-bold text-[#2C3A48] leading-tight">
            {product.name}
          </h2>

          {/* Description */}
          <p className="text-sm text-gray-500 leading-relaxed">
            {product.description}
          </p>

          {/* Stock */}
          {product.stock > 10 ? (
            <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">10+ in stock</span>
          ) : product.stock > 0 ? (
            <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">Only {product.stock} left</span>
          ) : (
            <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">Out of stock</span>
          )}

          {/* Price */}
          <p className="text-3xl font-bold text-[#2C3A48]">
            {formatPrice(product.price)}
          </p>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mt-1">
            {/* Quantity counter */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-[#E87B3A] hover:bg-orange-50 transition-colors"
              >
                <span className="text-base leading-none font-medium">−</span>
              </button>
              <span className="w-6 text-center text-sm font-semibold text-[#2C3A48]">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-[#E87B3A] hover:bg-orange-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500 disabled:hover:bg-transparent"
              >
                <span className="text-base leading-none font-medium">+</span>
              </button>
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={handleAddToCart}
              whileTap={{ scale: 0.96 }}
              className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#2C3A48] text-white rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C3A48]"
              aria-label={`Add ${product.name} to cart`}
            >
              <AnimatePresence>
                {ripple && (
                  <motion.span key="ripple" className="absolute inset-0 rounded-xl pointer-events-none"
                    initial={{ scale: 0, opacity: 0.35 }} animate={{ scale: 2.5, opacity: 0 }} exit={{}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ background: "#E87B3A", transformOrigin: "center" }} />
                )}
              </AnimatePresence>
              <ShoppingCart className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Add to Cart</span>
            </motion.button>
          </div>

          {/* Related Parts */}
          {related.length > 0 && (
            <>
              <div className="h-px bg-gray-100 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-[#2C3A48] mb-3">
                  Related Parts
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-0.5 px-0.5">
                  {related.map((p) => (
                    <RelatedTile key={p.id} product={p} onSelect={onSelectRelated} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ProductModal (public export) ─────────────────────────────────────────────

export interface ProductModalProps {
  product: MockProduct | null;
  onClose: () => void;
  onSelectRelated?: (product: MockProduct) => void;
}

export default function ProductModal({
  product,
  onClose,
  onSelectRelated,
}: ProductModalProps) {
  // Escape key handler
  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [product, onClose]);

  // Scroll lock
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  const handleSelectRelated = (p: MockProduct) => {
    if (onSelectRelated) onSelectRelated(p);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal wrapper — centers the card */}
          <motion.div
            key="modal-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label={`Product detail: ${product.name}`}
          >
            {/* key={product.id} forces ModalInner to remount on product swap,
                resetting internal color/wishlist state cleanly */}
            <ModalInner
              key={product.id}
              product={product}
              onClose={onClose}
              onSelectRelated={handleSelectRelated}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
