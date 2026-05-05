"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Package, ShoppingCart, Heart,
  Plug, Zap, Wrench, ShieldCheck, Box, Settings, Cpu,
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { MockProduct } from "@/lib/mock-data";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";

const CATEGORY_COLORS: Record<string, string> = {
  Hydraulic: "bg-blue-50 text-blue-700",
  Electrical: "bg-yellow-50 text-yellow-700",
  Mechanical: "bg-gray-100 text-gray-700",
  Safety: "bg-green-50 text-green-700",
  Controls: "bg-purple-50 text-purple-700",
};

const CATEGORY_PLACEHOLDER: Record<string, { bg: string; icon: React.ElementType }> = {
  "Conduit & Fittings": { bg: "from-slate-100 to-slate-200", icon: Plug },
  "Wire & Cable":       { bg: "from-yellow-50 to-yellow-100", icon: Zap },
  Fasteners:            { bg: "from-zinc-100 to-zinc-200", icon: Settings },
  "Elevator Components":{ bg: "from-orange-50 to-orange-100", icon: Cpu },
  Electrical:           { bg: "from-amber-50 to-amber-100", icon: Zap },
  Tools:                { bg: "from-stone-100 to-stone-200", icon: Wrench },
  "Safety & PPE":       { bg: "from-green-50 to-green-100", icon: ShieldCheck },
  Supplies:             { bg: "from-sky-50 to-sky-100", icon: Box },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

interface ProductCardProps {
  product: MockProduct;
  className?: string;
  onClick?: () => void;
}

export default function ProductCard({ product, className, onClick }: ProductCardProps) {
  const categoryColor = CATEGORY_COLORS[product.category] ?? "bg-gray-100 text-gray-700";
  const { toggle, has } = useWishlist();
  const wishlisted = has(product.id);
  const { add: addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    for (let i = 0; i < quantity; i++) addToCart(product);
    setAdded(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 400);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleQty = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setQuantity((q) => Math.min(product.stock, Math.max(1, q + delta)));
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      className={clsx(
        "bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Image area */}
      <div className="relative bg-white aspect-square overflow-hidden">
        {product.image ? (
          <div className={clsx("absolute inset-[12.5%] transition-all duration-300", added && "blur-sm scale-105")}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (() => {
          const ph = CATEGORY_PLACEHOLDER[product.category] ?? { bg: "from-gray-100 to-gray-200", icon: Package };
          const PlaceholderIcon = ph.icon;
          return (
            <div className={clsx(`w-full h-full bg-gradient-to-br ${ph.bg} flex flex-col items-center justify-center gap-2 transition-all duration-300`, added && "blur-sm")}>
              <PlaceholderIcon className="w-12 h-12 text-gray-400/70" strokeWidth={1.25} />
              <span className="text-[10px] font-medium text-gray-400 tracking-wide uppercase px-3 text-center leading-tight line-clamp-2">
                {product.category}
              </span>
            </div>
          );
        })()}

        {/* Category badge */}
        <span className={clsx("absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10", categoryColor)}>
          {product.category}
        </span>

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(product); }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
        >
          <Heart className={clsx("w-4 h-4 transition-colors", wishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-400")} />
        </button>

        {/* Added to cart overlay */}
        <AnimatePresence>
          {added && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated circle + checkmark */}
              <motion.svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                className="drop-shadow-lg"
              >
                {/* Circle */}
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="white"
                  strokeWidth="2.5"
                  fill="rgba(40,167,69,0.85)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  strokeLinecap="round"
                />
                {/* Checkmark */}
                <motion.path
                  d="M17 28.5L24.5 36L39 21"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }}
                />
              </motion.svg>

              {/* Text */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.2 }}
                className="mt-2 text-[11px] font-semibold text-white drop-shadow text-center leading-tight px-2"
              >
                Added to Cart<br />Successfully
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Stock + Price row */}
        <div className="flex items-center justify-between gap-2">
          {product.stock > 10 ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">10+ in stock</span>
          ) : product.stock > 0 ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Only {product.stock} left</span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Out of stock</span>
          )}
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
        </div>

        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {/* Counter */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={clsx("flex items-center gap-1.5 border rounded-lg px-2 py-1.5 shrink-0", product.stock <= 0 ? "border-gray-100 opacity-40 pointer-events-none" : "border-gray-200")}
          >
            <button onClick={(e) => handleQty(e, -1)} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[#E87B3A] transition-colors text-sm font-medium">−</button>
            <span className="w-5 text-center text-xs font-semibold text-[#2C3A48]">{quantity}</span>
            <button onClick={(e) => handleQty(e, 1)} disabled={quantity >= product.stock} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-[#E87B3A] transition-colors text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-500">+</button>
          </div>

          {/* Add to Cart */}
          <motion.button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            whileTap={product.stock > 0 ? { scale: 0.96 } : {}}
            className={clsx(
              "relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold border rounded-lg overflow-hidden transition-colors",
              product.stock <= 0
                ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                : "border-gray-200 text-gray-700 hover:border-[#E87B3A] hover:text-[#E87B3A]"
            )}
          >
            <AnimatePresence>
              {ripple && (
                <motion.span key="ripple" className="absolute inset-0 rounded-lg pointer-events-none"
                  initial={{ scale: 0, opacity: 0.35 }} animate={{ scale: 2.5, opacity: 0 }} exit={{}}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ background: "#E87B3A", transformOrigin: "center" }} />
              )}
            </AnimatePresence>
            <ShoppingCart className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{product.stock <= 0 ? "Out of Stock" : "Add to Cart"}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
