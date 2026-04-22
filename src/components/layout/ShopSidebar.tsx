"use client";

import {
  Package, Cable, Zap, Wrench, Shield, ChevronDown,
  ArrowUpDown, Hammer, Lightbulb, Layers, Settings,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

const ORANGE = "#E87B3A";

function getCategoryIcon(cat: string): React.ReactNode {
  const n = cat.toLowerCase();
  if (n.includes("conduit") || n.includes("fitting")) return <Cable className="w-4 h-4" />;
  if (n.includes("wire") || n.includes("cable"))       return <Zap className="w-4 h-4" />;
  if (n.includes("fastener"))                          return <Settings className="w-4 h-4" />;
  if (n.includes("elevator"))                          return <ArrowUpDown className="w-4 h-4" />;
  if (n.includes("electrical"))                        return <Layers className="w-4 h-4" />;
  if (n.includes("tool"))                              return <Hammer className="w-4 h-4" />;
  if (n.includes("safety") || n.includes("ppe"))       return <Shield className="w-4 h-4" />;
  if (n.includes("suppli"))                            return <Lightbulb className="w-4 h-4" />;
  if (n === "all")                                     return <Package className="w-4 h-4" />;
  return <Wrench className="w-4 h-4" />;
}

export interface SidebarCategory {
  id: string;
  label: string;
  subcategories?: { id: string; label: string }[];
}

interface ShopSidebarProps {
  selected: string;
  onSelect: (id: string) => void;
  categories?: SidebarCategory[];
}

export default function ShopSidebar({ selected, onSelect, categories = [] }: ShopSidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const all: SidebarCategory = { id: "all", label: "All Parts" };
  const items = [all, ...categories.filter((c) => c.id !== "all")];

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <p className="text-sm font-bold text-gray-900 mb-3">Category</p>
      <ul className="space-y-0.5">
        {items.map((cat) => {
          const isSelected = selected === cat.id;
          const isExpanded = expanded[cat.id];
          const hasSubs = cat.subcategories && cat.subcategories.length > 0;

          return (
            <li key={cat.id}>
              <div
                className={clsx(
                  "flex items-center rounded-lg text-sm font-medium relative overflow-hidden",
                  isSelected ? "text-white" : "text-gray-600"
                )}
                style={isSelected ? { background: ORANGE } : undefined}
              >
                {isSelected && (
                  <motion.span
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    initial={{ scale: 0, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ background: "white", transformOrigin: "left center" }}
                  />
                )}

                <motion.button
                  onClick={() => onSelect(cat.id)}
                  whileTap={{ scale: 0.97 }}
                  className={clsx(
                    "flex-1 flex items-center gap-2.5 px-3 py-2 text-left",
                    !isSelected && "hover:bg-gray-100 hover:text-gray-900 rounded-l-lg"
                  )}
                >
                  <span className={isSelected ? "text-white" : "text-gray-400"}>
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span className="truncate">{cat.label}</span>
                </motion.button>

                {hasSubs && (
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); toggle(cat.id); }}
                    whileTap={{ scale: 0.9 }}
                    className={clsx(
                      "px-2 py-2 rounded-r-lg shrink-0",
                      isSelected ? "text-white/70 hover:text-white" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="block"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                  </motion.button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {hasSubs && isExpanded && (
                  <motion.ul
                    key="subs"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden mt-0.5 ml-3 pl-3 border-l border-orange-100 space-y-0.5"
                  >
                    {cat.subcategories!.map((sub, i) => (
                      <motion.li
                        key={sub.id}
                        initial={{ x: -8, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.18 }}
                      >
                        <motion.button
                          onClick={() => onSelect(sub.id)}
                          whileTap={{ scale: 0.96 }}
                          className={clsx(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors text-left",
                            selected === sub.id ? "text-white" : "text-gray-500 hover:bg-orange-50 hover:text-gray-800"
                          )}
                          style={selected === sub.id ? { background: ORANGE } : undefined}
                        >
                          {sub.label}
                        </motion.button>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
