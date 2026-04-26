"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, CreditCard, Package, ShieldCheck,
  Lock, Plus, Loader2, History,
} from "lucide-react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface Address {
  id: string;
  label: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}

interface SavedCard {
  id: string;
  card: { brand: string; last4: string; exp_month: number; exp_year: number };
}

const BRAND_LABEL: Record<string, string> = {
  visa: "Visa", mastercard: "Mastercard", amex: "Amex",
  discover: "Discover", jcb: "JCB", unionpay: "UnionPay", unknown: "Card",
};

const BRAND_COLOR: Record<string, string> = {
  visa: "bg-blue-600", mastercard: "bg-red-500",
  amex: "bg-blue-400", discover: "bg-orange-400",
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 2,
  }).format(cents / 100);
}

function shippingCostForState(state: string | undefined): number | null {
  if (!state) return null;
  return state.trim().toUpperCase() === "NY" ? 2500 : 5000;
}

// ── Inline Add Address Form ─────────────────────────────────────────────────
function InlineAddressForm({
  userId, onSaved, onCancel, hideCancel,
}: {
  userId?: string;
  onSaved: (addr: Address) => void;
  onCancel?: () => void;
  hideCancel?: boolean;
}) {
  const [form, setForm] = useState({
    label: "Home", full_name: "", line1: "", line2: "", city: "", state: "", zip: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.full_name || !form.line1 || !form.city || !form.state || !form.zip) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setError("");

    // Signed-in users: persist to Supabase
    if (userId) {
      const { data, error: err } = await supabase
        .from("user_addresses")
        .insert({ user_id: userId, ...form, is_default: false })
        .select()
        .single();
      setSaving(false);
      if (err) { setError("Could not save address. Please try again."); return; }
      onSaved(data as Address);
      return;
    }

    // Guest: use local object only
    setSaving(false);
    onSaved({ id: `guest-${Date.now()}`, ...form, is_default: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-2xl border border-[#2C3A48]/15 bg-gray-50 p-4 flex flex-col gap-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {!userId ? "Delivery address for this purchase" : "New Address"}
        </p>

        {!!userId && (
          <div className="flex gap-2">
            {["Home", "Work", "Other"].map((l) => (
              <button key={l} type="button" onClick={() => set("label", l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${form.label === l ? "bg-[#2C3A48] text-white border-[#2C3A48]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                {l}
              </button>
            ))}
          </div>
        )}

        <input placeholder="Full Name *" value={form.full_name} onChange={(e) => set("full_name", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
        <input placeholder="Street Address *" value={form.line1} onChange={(e) => set("line1", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
        <input placeholder="Apt, Suite (optional)" value={form.line2} onChange={(e) => set("line2", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
        <div className="grid grid-cols-3 gap-2">
          <input placeholder="City *" value={form.city} onChange={(e) => set("city", e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
          <input placeholder="State *" value={form.state} onChange={(e) => set("state", e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
          <input placeholder="ZIP *" value={form.zip} onChange={(e) => set("zip", e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Use This Address"}
          </button>
          {!hideCancel && onCancel && (
            <button onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-white transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Inline Add Card Form ────────────────────────────────────────────────────
function InlineCardFormInner({
  email, name, stripeCustomerId, isGuest, onSaved, onCancel, hideCancel,
}: {
  email: string;
  name: string;
  stripeCustomerId: string | undefined;
  isGuest?: boolean;
  onSaved: (customerId: string, paymentMethodId: string) => void;
  onCancel: () => void;
  hideCancel?: boolean;
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

    const { setupIntent, error: stripeErr } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: elements.getElement(CardElement)! },
    });
    setSaving(false);
    if (stripeErr) { setError(stripeErr.message ?? "Failed to save card"); return; }
    const pmId = typeof setupIntent?.payment_method === "string"
      ? setupIntent.payment_method
      : (setupIntent?.payment_method?.id ?? "");
    onSaved(customerId, pmId);
  };

  return (
    <motion.form onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-2xl border border-[#635bff]/20 bg-[#635bff]/5 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {isGuest ? "Card for this purchase" : "New Card"}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <ShieldCheck className="w-3 h-3 text-[#635bff]" />
            <span>Secured by <span className="font-bold text-[#635bff]">Stripe</span></span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Card Details
          </label>
          <div className="px-4 py-3 rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-[#635bff]/30 focus-within:border-[#635bff] transition">
            <CardElement onReady={() => setCardReady(true)}
              options={{ style: { base: { fontSize: "14px", color: "#2C3A48", fontFamily: "inherit", "::placeholder": { color: "#9ca3af" } }, invalid: { color: "#ef4444" } }, hidePostalCode: true }} />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500">{error}</p>}

        <div className="flex gap-2">
          <motion.button type="submit" disabled={saving || !cardReady} whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> Use This Card</>}
          </motion.button>
          {!hideCancel && (
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-1 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[10px] text-gray-400"><Lock className="w-3 h-3" /> SSL Encrypted</div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400"><ShieldCheck className="w-3 h-3 text-[#635bff]" /> PCI Compliant</div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="text-[10px] text-gray-400"><span className="font-bold text-[#635bff]">Stripe</span> Verified</div>
        </div>
      </div>
    </motion.form>
  );
}

function InlineCardForm(props: Parameters<typeof InlineCardFormInner>[0] & { isGuest?: boolean }) {
  return (
    <Elements stripe={stripePromise}>
      <AnimatePresence>
        <InlineCardFormInner {...props} />
      </AnimatePresence>
    </Elements>
  );
}

// ── Order Confirmation Overlay ──────────────────────────────────────────────
function OrderConfirmation({ onClear }: { onClear: () => void }) {
  const router = useRouter();

  const handleGoToHistory = () => {
    onClear();
    window.dispatchEvent(new CustomEvent("open-purchase-history"));
    router.push("/");
  };

  const handleContinue = () => {
    onClear();
    router.push("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 26, delay: 0.08 }}
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center text-center gap-6"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center"
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <motion.circle cx="32" cy="32" r="28" fill="rgba(40,167,69,0.15)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }} />
            <motion.circle cx="32" cy="32" r="22" fill="rgba(40,167,69,0.9)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.38 }} />
            <motion.path d="M21 32L28.5 39.5L43 25" stroke="white" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }} />
          </svg>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <h2 className="text-2xl font-extrabold text-[#2C3A48] mb-2">Order Confirmed!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Thank you for your purchase. A confirmation email with your order details and tracking information will be sent to your inbox shortly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="w-full p-4 rounded-2xl bg-[#2C3A48]/5 border border-[#2C3A48]/10 flex items-center gap-3 text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[#2C3A48]/10 flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-[#2C3A48]" />
          </div>
          <p className="text-xs text-gray-500 leading-snug">
            Track your order anytime in{" "}
            <span className="font-semibold text-[#2C3A48]">Purchase History</span>{" "}
            under your profile once it&apos;s been processed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}
          className="flex flex-col gap-2.5 w-full"
        >
          <button onClick={handleGoToHistory}
            className="w-full py-3 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors flex items-center justify-center gap-2">
            <History className="w-4 h-4" /> Go to Purchase History
          </button>
          <button onClick={handleContinue}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Checkout Page ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { user, loading, setUser } = useAuth();
  const { items, clear } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [fetchingCards, setFetchingCards] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const stripeCustomerId = user?.user_metadata?.stripe_customer_id as string | undefined;
  const isGuest = !loading && !user;

  const fetchAddresses = useCallback(async () => {
    if (!user) { setFetchingAddresses(false); return; }
    setFetchingAddresses(true);
    try {
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });
      const list = (data ?? []) as Address[];
      setAddresses(list);
      const def = list.find((a) => a.is_default) ?? list[0];
      if (def) setSelectedAddressId(def.id);
    } catch {}
    setFetchingAddresses(false);
  }, [user]);

  const fetchCards = useCallback(async () => {
    if (!user || !stripeCustomerId) { setFetchingCards(false); return; }
    setFetchingCards(true);
    try {
      const res = await fetch(`/api/stripe/payment-methods?customerId=${stripeCustomerId}`);
      const { methods } = await res.json();
      const list = (methods ?? []) as SavedCard[];
      setCards(list);
      if (list.length > 0) setSelectedCardId(list[0].id);
    } catch {}
    setFetchingCards(false);
  }, [stripeCustomerId]);

  useEffect(() => {
    fetchAddresses();
    fetchCards();
  }, [fetchAddresses, fetchCards]);

  // Once auth resolves and there's no user, open the inline forms automatically
  useEffect(() => {
    if (!loading && !user) {
      setShowAddAddress(true);
      setShowAddCard(true);
    }
  }, [loading, user]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const shippingCost = shippingCostForState(selectedAddress?.state);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + (shippingCost ?? 0);
  // For guests the inline forms handle entry — canPlace requires an address was saved/selected and a card saved/selected
  const canPlace = !!selectedAddressId && !!selectedCardId && items.length > 0;

  const handlePlaceOrder = async () => {
    if (!canPlace) return;
    setPlacing(true);

    const addr = addresses.find((a) => a.id === selectedAddressId)!;

    if (user) {
      await supabase.from("user_orders").insert({
        user_id: user.id,
        status: "confirmed",
        items: items.map((i) => ({
          id: i.product.id,
          name: i.product.name,
          sku: i.product.sku,
          image: i.product.image ?? null,
          price: i.product.price,
          quantity: i.quantity,
        })),
        subtotal,
        shipping_cost: shippingCost ?? 0,
        total,
        shipping_address: {
          full_name: addr.full_name,
          line1: addr.line1,
          line2: addr.line2 ?? null,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
        },
      });
    }

    setPlacing(false);
    setConfirmed(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
    </div>
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          <div className="mb-6">
            <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E87B3A] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#2C3A48] mb-8">Checkout</h1>

          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Left column ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

              {/* Step 1: Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-[#2C3A48] flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                  <h2 className="text-base font-bold text-[#2C3A48] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" /> Shipping Address
                  </h2>
                </div>

                {isGuest ? (
                  /* ── Guest address: single-form flow ── */
                  <>
                    <AnimatePresence mode="wait">
                      {showAddAddress ? (
                        <InlineAddressForm
                          key="form"
                          userId={undefined}
                          hideCancel
                          onSaved={(addr) => {
                            setAddresses([addr]);
                            setSelectedAddressId(addr.id);
                            setShowAddAddress(false);
                          }}
                          onCancel={() => {}}
                        />
                      ) : selectedAddress ? (
                        <motion.div
                          key="summary"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-[#2C3A48]/[0.04] border-2 border-[#2C3A48]"
                        >
                          <MapPin className="w-4 h-4 text-[#2C3A48] shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700">{selectedAddress.full_name}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {selectedAddress.line1}{selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""},{" "}
                              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddAddress(true)}
                            className="text-xs font-semibold text-[#E87B3A] hover:underline shrink-0"
                          >
                            Edit
                          </button>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </>
                ) : (
                  /* ── Signed-in address: list + add flow ── */
                  <>
                    {fetchingAddresses ? (
                      <div className="flex flex-col gap-3">
                        {[0, 1].map((i) => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {addresses.map((addr) => (
                          <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                            className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all ${selectedAddressId === addr.id ? "border-[#2C3A48] bg-[#2C3A48]/[0.04]" : "border-gray-200 hover:border-gray-300"}`}>
                            <div className="flex items-start gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${selectedAddressId === addr.id ? "border-[#2C3A48] bg-[#2C3A48]" : "border-gray-300"}`}>
                                {selectedAddressId === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-[#2C3A48] uppercase tracking-wide">{addr.label}</span>
                                  {addr.is_default && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Default</span>}
                                </div>
                                <p className="text-sm font-semibold text-gray-700">{addr.full_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.zip}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {addresses.length === 0 && !showAddAddress && (
                          <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <MapPin className="w-8 h-8 text-gray-200" strokeWidth={1.5} />
                            <p className="text-sm text-gray-400">No saved addresses. Add one below to continue.</p>
                          </div>
                        )}
                      </div>
                    )}
                    <AnimatePresence>
                      {showAddAddress && (
                        <InlineAddressForm
                          userId={user?.id}
                          onSaved={(addr) => {
                            setAddresses((prev) => [...prev, addr]);
                            setSelectedAddressId(addr.id);
                            setShowAddAddress(false);
                          }}
                          onCancel={() => setShowAddAddress(false)}
                        />
                      )}
                    </AnimatePresence>
                    {!showAddAddress && (
                      <button onClick={() => setShowAddAddress(true)}
                        className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#2C3A48] hover:text-[#2C3A48] transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add New Address
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Step 2: Payment Method */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#2C3A48] flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
                    <h2 className="text-base font-bold text-[#2C3A48] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" /> Payment Method
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#635bff]/5 rounded-full px-3 py-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#635bff]" />
                    <span className="text-[11px] font-semibold text-[#635bff]">Stripe Secured</span>
                  </div>
                </div>

                {isGuest ? (
                  /* ── Guest card: single-form flow ── */
                  <>
                    <AnimatePresence mode="wait">
                      {showAddCard ? (
                        <InlineCardForm
                          key="form"
                          email=""
                          name=""
                          stripeCustomerId={undefined}
                          isGuest
                          hideCancel
                          onSaved={async (customerId) => {
                            setShowAddCard(false);
                            try {
                              const res = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`);
                              const { methods } = await res.json();
                              const list = (methods ?? []) as SavedCard[];
                              setCards(list);
                              if (list.length > 0) setSelectedCardId(list[0].id);
                            } catch {}
                          }}
                          onCancel={() => {}}
                        />
                      ) : selectedCardId && cards.length > 0 ? (() => {
                        const pm = cards.find((c) => c.id === selectedCardId) ?? cards[0];
                        return (
                          <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#2C3A48]/[0.04] border-2 border-[#2C3A48]"
                          >
                            <div className={`w-10 h-6 rounded flex items-center justify-center text-white text-[9px] font-extrabold shrink-0 ${BRAND_COLOR[pm.card.brand] ?? "bg-gray-400"}`}>
                              {(BRAND_LABEL[pm.card.brand] ?? "CARD").slice(0, 4).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#2C3A48]">
                                {BRAND_LABEL[pm.card.brand] ?? "Card"} •••• {pm.card.last4}
                              </p>
                              <p className="text-xs text-gray-400">
                                Expires {pm.card.exp_month.toString().padStart(2, "0")}/{pm.card.exp_year}
                              </p>
                            </div>
                            <button
                              onClick={() => { setCards([]); setSelectedCardId(null); setShowAddCard(true); }}
                              className="text-xs font-semibold text-[#E87B3A] hover:underline shrink-0"
                            >
                              Change
                            </button>
                          </motion.div>
                        );
                      })() : null}
                    </AnimatePresence>
                  </>
                ) : (
                  /* ── Signed-in card: list + add flow ── */
                  <>
                    {fetchingCards ? (
                      <div className="flex flex-col gap-3">
                        {[0, 1].map((i) => <div key={i} className="h-14 rounded-2xl bg-gray-100 animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {cards.map((pm) => (
                          <button key={pm.id} onClick={() => setSelectedCardId(pm.id)}
                            className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all ${selectedCardId === pm.id ? "border-[#2C3A48] bg-[#2C3A48]/[0.04]" : "border-gray-200 hover:border-gray-300"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selectedCardId === pm.id ? "border-[#2C3A48] bg-[#2C3A48]" : "border-gray-300"}`}>
                                {selectedCardId === pm.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div className={`w-10 h-6 rounded flex items-center justify-center text-white text-[9px] font-extrabold shrink-0 ${BRAND_COLOR[pm.card.brand] ?? "bg-gray-400"}`}>
                                {(BRAND_LABEL[pm.card.brand] ?? "CARD").slice(0, 4).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#2C3A48]">
                                  {BRAND_LABEL[pm.card.brand] ?? "Card"} •••• {pm.card.last4}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Expires {pm.card.exp_month.toString().padStart(2, "0")}/{pm.card.exp_year}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {cards.length === 0 && !showAddCard && (
                          <div className="flex flex-col items-center gap-2 py-6 text-center">
                            <CreditCard className="w-8 h-8 text-gray-200" strokeWidth={1.5} />
                            <p className="text-sm text-gray-400">No saved cards. Add one below to continue.</p>
                          </div>
                        )}
                      </div>
                    )}
                    <AnimatePresence>
                      {showAddCard && (
                        <InlineCardForm
                          email={user?.email ?? ""}
                          name={(user?.user_metadata?.full_name as string) ?? ""}
                          stripeCustomerId={stripeCustomerId}
                          onSaved={async (customerId) => {
                            if (!stripeCustomerId) {
                              const { data } = await supabase.auth.updateUser({
                                data: { stripe_customer_id: customerId },
                              });
                              if (data.user) setUser(data.user);
                            }
                            setShowAddCard(false);
                            try {
                              const res = await fetch(`/api/stripe/payment-methods?customerId=${customerId}`);
                              const { methods } = await res.json();
                              const list = (methods ?? []) as SavedCard[];
                              setCards(list);
                              if (list.length > 0) setSelectedCardId(list[0].id);
                            } catch {}
                          }}
                          onCancel={() => setShowAddCard(false)}
                        />
                      )}
                    </AnimatePresence>
                    {!showAddCard && (
                      <button onClick={() => setShowAddCard(true)}
                        className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#635bff] hover:text-[#635bff] transition-colors flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Add Payment Method
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Step 3: Shipping Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded-full bg-[#2C3A48] flex items-center justify-center text-white text-xs font-bold shrink-0">3</div>
                  <h2 className="text-base font-bold text-[#2C3A48] flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" /> Shipping
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <Package className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 leading-relaxed">
                      <p className="font-bold mb-1">Flat Rate Shipping</p>
                      <p>All orders ship from <span className="font-semibold">Long Island City, NY 11101</span>.</p>
                      <div className="mt-2 flex flex-col gap-0.5">
                        <p><span className="font-semibold">New York (NY):</span> $25.00 flat rate</p>
                        <p><span className="font-semibold">New Jersey (NJ) &amp; other states:</span> $50.00 flat rate</p>
                      </div>
                    </div>
                  </div>

                  {selectedAddress && (
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-sm text-gray-500">
                        Shipping to <span className="font-semibold text-[#2C3A48]">{selectedAddress.city}, {selectedAddress.state}</span>
                      </span>
                      <span className="text-sm font-bold text-[#2C3A48]">
                        {shippingCost !== null ? formatPrice(shippingCost) : "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right column: Order Summary ── */}
            <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-[#2C3A48] mb-5">Order Summary</h2>

                {/* Items */}
                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mb-5 pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {item.product.image ? (
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-300" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#2C3A48] line-clamp-2 leading-snug">{item.product.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-[#2C3A48] shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2.5 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#2C3A48]">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shippingCost !== null ? "text-[#2C3A48]" : "text-gray-400 text-xs"}`}>
                      {shippingCost !== null ? formatPrice(shippingCost) : "Select address"}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-[#2C3A48]">
                    <span>Total</span>
                    <span>{shippingCost !== null ? formatPrice(total) : "—"}</span>
                  </div>
                </div>

                {/* Place Order */}
                <motion.button
                  onClick={handlePlaceOrder}
                  disabled={!canPlace || placing}
                  whileTap={canPlace ? { scale: 0.97 } : {}}
                  className="mt-5 w-full py-3.5 rounded-xl bg-[#E87B3A] text-white text-sm font-bold hover:bg-[#d46d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Complete Order</>
                  )}
                </motion.button>

                {!canPlace && (
                  <p className="mt-2 text-[10px] text-center text-gray-400">
                    {!selectedAddressId && !selectedCardId
                      ? "Select an address and a payment method to continue"
                      : !selectedAddressId
                      ? "Select a shipping address to continue"
                      : "Select a payment method to continue"}
                  </p>
                )}

                {/* Trust row */}
                <div className="mt-4 flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Lock className="w-3 h-3" /> SSL Encrypted
                  </div>
                  <div className="w-px h-3 bg-gray-200" />
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <ShieldCheck className="w-3 h-3 text-[#635bff]" />
                    <span className="font-bold text-[#635bff]">Stripe</span>
                    <span>Secured</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {confirmed && <OrderConfirmation onClear={clear} />}
      </AnimatePresence>
    </>
  );
}
