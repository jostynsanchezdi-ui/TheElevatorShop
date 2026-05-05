"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, ShoppingBag, ChevronDown, ChevronUp, Loader2, FileText, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
}

interface Order {
  id: string;
  po_number: number;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddress;
  created_at: string;
}

interface PurchaseHistoryModalProps {
  open: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  confirmed: { label: "Confirmed",  classes: "bg-blue-50 text-blue-600 border-blue-100" },
  shipped:   { label: "Shipped",    classes: "bg-amber-50 text-amber-600 border-amber-100" },
  delivered: { label: "Delivered",  classes: "bg-green-50 text-green-600 border-green-100" },
  cancelled: { label: "Cancelled",  classes: "bg-rose-50 text-rose-500 border-rose-100" },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_STYLES[order.status] ?? STATUS_STYLES.confirmed;

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[#2C3A48]/8 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-[#2C3A48]" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-mono font-bold text-[#2C3A48] truncate">
              #{`PO-${String(order.po_number).padStart(5, "0")}`}
            </p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.classes}`}>
              {status.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatDate(order.created_at)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-[#2C3A48]">{formatPrice(order.total)}</p>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-auto mt-1" />}
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 py-4">

              {/* PO actions */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-9 h-10 rounded-lg bg-[#2C3A48] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#2C3A48]">Purchase Order</p>
                  <p className="text-[10px] text-gray-400">#{`PO-${String(order.po_number).padStart(5, "0")}`}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.open(`/po/${order.id}`, "_blank")}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-[#2C3A48] border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> View
                  </button>
                  <button
                    onClick={() => window.open(`/po/${order.id}?print=1`, "_blank")}
                    className="px-2.5 py-1.5 text-[11px] font-semibold bg-[#2C3A48] text-white rounded-lg hover:bg-[#1e2a35] transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PurchaseHistoryModal({ open, onClose }: PurchaseHistoryModalProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("user_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (open) fetchOrders();
  }, [open, fetchOrders]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="relative flex items-center gap-4 px-7 py-6 shrink-0"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #E87B3A 100%)" }}
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-tight">Purchase History</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    {orders.length > 0 ? `${orders.length} order${orders.length !== 1 ? "s" : ""}` : "Your past orders and receipts"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-14 text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-gray-300" strokeWidth={1} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <p className="text-base font-extrabold text-[#2C3A48]">No orders yet</p>
                      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                        Your purchase history will appear here once you place your first order.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="mt-1 px-6 py-2.5 rounded-xl bg-[#E87B3A] text-white text-sm font-bold hover:bg-[#d06b2a] transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  orders.map((order) => <OrderCard key={order.id} order={order} />)
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
