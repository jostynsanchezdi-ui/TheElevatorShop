"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Package, ShieldCheck,
  Lock, Plus, Loader2, FileText, Download, ExternalLink, Building2,
} from "lucide-react";
import Autocomplete from "react-google-autocomplete";
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
  const [resetKey, setResetKey] = useState(0);
  const [stateBounds, setStateBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [streetKey, setStreetKey] = useState(0);

  // stateBounds is used only to satisfy the linter; it's a future-use field
  void stateBounds;

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getComp = (place: any, type: string) =>
    place.address_components?.find((c: { types: string[]; long_name: string; short_name: string }) => c.types.includes(type));

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

        {/* Street — fills city, state, zip on selection */}
        <Autocomplete
          key={`street-${streetKey}`}
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
          onPlaceSelected={(place) => {
            const streetNumber = getComp(place, "street_number")?.long_name ?? "";
            const route = getComp(place, "route")?.long_name ?? "";
            const city = getComp(place, "locality")?.long_name ?? getComp(place, "sublocality_level_1")?.long_name ?? getComp(place, "administrative_area_level_2")?.long_name ?? "";
            const state = getComp(place, "administrative_area_level_1")?.short_name ?? "";
            const zip = getComp(place, "postal_code")?.long_name ?? "";
            const line1 = `${streetNumber} ${route}`.trim();
            setForm((f) => ({ ...f, line1, city, state, zip }));
            setResetKey((k) => k + 1);
            setStreetKey((k) => k + 1);
          }}
          options={{ types: ["address"], componentRestrictions: { country: "us" } }}
          placeholder="Street Address *"
          defaultValue={form.line1}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
        />

        <input placeholder="Apt, Suite (optional)" value={form.line2} onChange={(e) => set("line2", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />

        {/* City + State */}
        <div className="grid grid-cols-2 gap-2">
          <Autocomplete
            key={`city-${resetKey}`}
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
            defaultValue={form.city}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("city", e.target.value)}
            onPlaceSelected={(place) => {
              const city = getComp(place, "locality")?.long_name ?? getComp(place, "sublocality_level_1")?.long_name ?? getComp(place, "administrative_area_level_2")?.long_name ?? "";
              const state = getComp(place, "administrative_area_level_1")?.short_name ?? "";
              setForm((f) => ({ ...f, city, ...(state && { state }) }));
              setResetKey((k) => k + 1);
            }}
            options={{ types: ["(cities)"], componentRestrictions: { country: "us" } }}
            placeholder="City *"
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
          />
          <Autocomplete
            key={`state-${resetKey}`}
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
            defaultValue={form.state}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => set("state", e.target.value)}
            onPlaceSelected={(place) => {
              const state = getComp(place, "administrative_area_level_1")?.short_name ?? "";
              if (state) set("state", state);
              const vp = place.geometry?.viewport;
              if (vp) {
                setStateBounds({ north: vp.getNorthEast().lat(), south: vp.getSouthWest().lat(), east: vp.getNorthEast().lng(), west: vp.getSouthWest().lng() });
                setStreetKey((k) => k + 1);
              }
            }}
            options={{ types: ["(regions)"], componentRestrictions: { country: "us" } }}
            placeholder="State *"
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
          />
        </div>

        {/* ZIP */}
        <input placeholder="ZIP *" value={form.zip} onChange={(e) => set("zip", e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition" />

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

// ── PO Confirmation Overlay ─────────────────────────────────────────────────
function OrderConfirmation({ onClear, orderId }: { onClear: () => void; orderId: string | null }) {
  const router = useRouter();

  const handleContinue = () => {
    onClear();
    router.push("/");
  };

  const handleView = () => {
    if (orderId) window.open(`/po/${orderId}`, "_blank");
  };

  const handleDownload = () => {
    if (orderId) window.open(`/po/${orderId}?print=1`, "_blank");
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
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center text-center gap-6"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-[#E87B3A]/10 flex items-center justify-center"
        >
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <motion.circle cx="32" cy="32" r="28" fill="rgba(232,123,58,0.15)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }} />
            <motion.circle cx="32" cy="32" r="22" fill="rgba(232,123,58,0.9)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 20, delay: 0.38 }} />
            <motion.path d="M21 32L28.5 39.5L43 25" stroke="white" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round" fill="none"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }} />
          </svg>
        </motion.div>

        {/* Thank you message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <h2 className="text-2xl font-extrabold text-[#2C3A48] mb-2">Thank You for Your Order!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Our team will be in touch shortly with an email containing the payment link and instructions to complete your order.
          </p>
        </motion.div>

        {/* PO Download */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4 text-left"
        >
          <div className="w-10 h-12 rounded-lg bg-[#2C3A48] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2C3A48]">Purchase Order</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {orderId ? "Your PO is ready to view or download" : "Sign in to save and access your PO"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleView}
              disabled={!orderId}
              className="px-3 py-1.5 text-xs font-semibold text-[#2C3A48] border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ExternalLink className="w-3 h-3" /> View
            </button>
            <button
              onClick={handleDownload}
              disabled={!orderId}
              className="px-3 py-1.5 text-xs font-semibold bg-[#2C3A48] text-white rounded-lg hover:bg-[#1e2a35] transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}
          className="w-full"
        >
          <button onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors">
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Checkout Page ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, clear } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [billTo, setBillTo] = useState({
    full_name: "", company: "", email: "", phone: "",
    line1: "", line2: "", city: "", state: "", zip: "",
  });
  const [billToError, setBillToError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Once auth resolves and there's no user, open the inline form automatically
  useEffect(() => {
    if (!loading && !user) {
      setShowAddAddress(true);
    }
  }, [loading, user]);

  // Pre-fill email from auth
  useEffect(() => {
    if (user?.email) {
      setBillTo((b) => ({ ...b, email: b.email || user.email! }));
    }
  }, [user]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const shippingCost = shippingCostForState(selectedAddress?.state);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const total = subtotal + (shippingCost ?? 0);
  const billToComplete = !!(billTo.full_name && billTo.email && billTo.line1 && billTo.city && billTo.state && billTo.zip);
  const canPlace = !!selectedAddressId && items.length > 0 && billToComplete;

  const handlePlaceOrder = async () => {
    if (!canPlace) return;
    if (!billToComplete) { setBillToError("Please complete all required billing fields."); return; }
    setBillToError("");
    setPlacing(true);

    const addr = addresses.find((a) => a.id === selectedAddressId)!;

    if (user) {
      const { data: orderData } = await supabase.from("user_orders").insert({
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
          billing: {
            full_name: billTo.full_name,
            company: billTo.company || null,
            email: billTo.email,
            phone: billTo.phone || null,
            line1: billTo.line1,
            line2: billTo.line2 || null,
            city: billTo.city,
            state: billTo.state,
            zip: billTo.zip,
          },
        },
      }).select("id").single();
      setOrderId(orderData?.id ?? null);
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

              {/* Step 1: Billing Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-[#2C3A48] flex items-center justify-center text-white text-xs font-bold shrink-0">1</div>
                  <h2 className="text-base font-bold text-[#2C3A48] flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" /> Billing Address
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Full Name *"
                      value={billTo.full_name}
                      onChange={(e) => setBillTo((b) => ({ ...b, full_name: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                    <input
                      placeholder="Company (optional)"
                      value={billTo.company}
                      onChange={(e) => setBillTo((b) => ({ ...b, company: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      placeholder="Email *"
                      type="email"
                      value={billTo.email}
                      onChange={(e) => setBillTo((b) => ({ ...b, email: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                    <input
                      placeholder="Phone (optional)"
                      type="tel"
                      value={billTo.phone}
                      onChange={(e) => setBillTo((b) => ({ ...b, phone: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                  </div>
                  <input
                    placeholder="Street Address *"
                    value={billTo.line1}
                    onChange={(e) => setBillTo((b) => ({ ...b, line1: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                  />
                  <input
                    placeholder="Apt, Suite (optional)"
                    value={billTo.line2}
                    onChange={(e) => setBillTo((b) => ({ ...b, line2: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      placeholder="City *"
                      value={billTo.city}
                      onChange={(e) => setBillTo((b) => ({ ...b, city: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                    <input
                      placeholder="State *"
                      value={billTo.state}
                      onChange={(e) => setBillTo((b) => ({ ...b, state: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                    <input
                      placeholder="ZIP *"
                      value={billTo.zip}
                      onChange={(e) => setBillTo((b) => ({ ...b, zip: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2C3A48]/20 focus:border-[#2C3A48] transition"
                    />
                  </div>
                  {billToError && <p className="text-xs text-rose-500">{billToError}</p>}
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-7 h-7 rounded-full bg-[#2C3A48] flex items-center justify-center text-white text-xs font-bold shrink-0">2</div>
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
                          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#2C3A48]/[0.04] border-2 border-[#2C3A48]"
                        >
                          <MapPin className="w-4 h-4 text-[#2C3A48] shrink-0" />
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

              {/* Step 3: Shipping Info */}
              <div className="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
                    <><ShieldCheck className="w-4 h-4" /> Get Purchase Order</>
                  )}
                </motion.button>

                {!canPlace && (
                  <p className="mt-2 text-[10px] text-center text-gray-400">
                    {!selectedAddressId
                      ? "Select a shipping address to continue"
                      : "Add items to your cart to continue"}
                  </p>
                )}

                {/* Trust row */}
                <div className="mt-4 flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Lock className="w-3 h-3" /> SSL Encrypted
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />

      <AnimatePresence>
        {confirmed && <OrderConfirmation onClear={clear} orderId={orderId} />}
      </AnimatePresence>
    </>
  );
}
