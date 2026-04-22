"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Trash2, Plus, Loader2, ShieldCheck, Lock } from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

interface PaymentMethodsModalProps {
  open: boolean;
  onClose: () => void;
}

interface SavedCard {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  discover: "Discover", jcb: "JCB", unionpay: "UnionPay", unknown: "Card",
};

function cardBrandIcon(brand: string) {
  const colors: Record<string, string> = {
    visa: "bg-blue-600", mastercard: "bg-red-500", amex: "bg-blue-400", discover: "bg-orange-400",
  };
  return (
    <div className={`w-8 h-5 rounded flex items-center justify-center text-white text-[9px] font-extrabold ${colors[brand] ?? "bg-gray-400"}`}>
      {(BRAND_LABEL[brand] ?? "CARD").slice(0, 4).toUpperCase()}
    </div>
  );
}

function StripeTrustBadge({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${compact ? "text-[10px]" : "text-xs"} text-gray-400`}>
      <ShieldCheck className={`${compact ? "w-3 h-3" : "w-3.5 h-3.5"} text-[#635bff]`} />
      <span>Secured & verified by</span>
      <span className="font-bold text-[#635bff]">Stripe</span>
    </div>
  );
}

function AddCardForm({ email, name, stripeCustomerId, onSaved, onCancel }: {
  email: string; name: string; stripeCustomerId: string | undefined;
  onSaved: (customerId: string) => void; onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cardReady, setCardReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setError("");
    setSaving(true);

    const res = await fetch("/api/stripe/setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, stripeCustomerId }),
    });
    const { clientSecret, customerId, error: apiErr } = await res.json();
    if (apiErr) { setError(apiErr); setSaving(false); return; }

    const { error: stripeErr } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });

    setSaving(false);
    if (stripeErr) { setError(stripeErr.message ?? "Failed to save card"); return; }
    onSaved(customerId);
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border border-[#635bff]/20 bg-[#635bff]/5 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">New Card</p>
          <StripeTrustBadge compact />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Card Details
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#635bff]/30 focus-within:border-[#635bff] transition">
            <CardElement
              onReady={() => setCardReady(true)}
              options={{
                style: {
                  base: {
                    fontSize: "14px",
                    color: "#2C3A48",
                    fontFamily: "inherit",
                    "::placeholder": { color: "#9ca3af" },
                  },
                  invalid: { color: "#ef4444" },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <div className="flex gap-2">
          <motion.button type="submit" disabled={saving || !cardReady} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving
              ? <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
              : <><Lock className="w-3.5 h-3.5" /> Save Card</>
            }
          </motion.button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <Lock className="w-3 h-3" /> SSL Encrypted
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <ShieldCheck className="w-3 h-3 text-[#635bff]" /> PCI Compliant
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="font-bold text-[#635bff]">Stripe</span> Verified
          </div>
        </div>
      </div>
    </motion.form>
  );
}

export default function PaymentMethodsModal({ open, onClose }: PaymentMethodsModalProps) {
  const { user, setUser } = useAuth();
  const [methods, setMethods] = useState<SavedCard[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stripeCustomerId = user?.user_metadata?.stripe_customer_id as string | undefined;

  const fetchMethods = useCallback(async () => {
    if (!stripeCustomerId) { setMethods([]); return; }
    setFetching(true);
    const res = await fetch(`/api/stripe/payment-methods?customerId=${stripeCustomerId}`);
    const { methods: data } = await res.json();
    setMethods(data ?? []);
    setFetching(false);
  }, [stripeCustomerId]);

  useEffect(() => {
    if (open) { fetchMethods(); setShowForm(false); }
  }, [open, fetchMethods]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await fetch("/api/stripe/payment-methods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentMethodId: id }),
    });
    setDeletingId(null);
    fetchMethods();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40" onClick={onClose} />

          <motion.div key="modal" initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative flex items-center gap-4 px-7 py-6 shrink-0"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #E87B3A 100%)" }}
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-tight">Payment Methods</p>
                  <p className="text-white/60 text-xs mt-0.5">Your saved cards and billing info</p>
                </div>
                <div className="ml-auto mr-8 hidden sm:flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span className="text-white/80 text-[11px] font-semibold">Stripe Verified</span>
                </div>
                <button onClick={onClose} aria-label="Close"
                  className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto">
                {fetching && (
                  <div className="flex flex-col gap-3">
                    {[0, 1].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
                  </div>
                )}

                {!fetching && methods.length === 0 && !showForm && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-semibold text-gray-400">No saved cards yet</p>
                  </div>
                )}

                {!fetching && methods.map((pm) => (
                  <div key={pm.id} className="rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-3">
                    {cardBrandIcon(pm.card.brand)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2C3A48]">
                        {BRAND_LABEL[pm.card.brand] ?? "Card"} •••• {pm.card.last4}
                      </p>
                      <p className="text-xs text-gray-400">
                        Expires {pm.card.exp_month.toString().padStart(2, "0")}/{pm.card.exp_year}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(pm.id)} disabled={deletingId === pm.id}
                      className="p-1.5 rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      aria-label="Remove card">
                      {deletingId === pm.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                ))}

                <Elements stripe={stripePromise}>
                  <AnimatePresence>
                    {showForm && user && (
                      <AddCardForm
                        key="add-card"
                        email={user.email ?? ""}
                        name={(user.user_metadata?.full_name as string) ?? ""}
                        stripeCustomerId={stripeCustomerId}
                        onSaved={async (customerId) => {
                          if (!stripeCustomerId) {
                            const { data } = await supabase.auth.updateUser({
                              data: { stripe_customer_id: customerId },
                            });
                            if (data.user) setUser(data.user);
                          }
                          setShowForm(false);
                          fetchMethods();
                        }}
                        onCancel={() => setShowForm(false)}
                      />
                    )}
                  </AnimatePresence>
                </Elements>

                {!showForm && (
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowForm(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#635bff] hover:text-[#635bff] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Payment Method
                  </motion.button>
                )}

                <div className="flex items-center justify-center gap-1.5 pt-2 pb-1">
                  <StripeTrustBadge />
                  <span className="text-[10px] text-gray-300 mx-1">·</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 256-bit SSL
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
