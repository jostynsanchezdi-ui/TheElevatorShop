"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star, Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";
import Autocomplete from "react-google-autocomplete";

interface AddressesModalProps {
  open: boolean;
  onClose: () => void;
}

interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

const LABEL_OPTIONS = ["Home", "Work", "Other"] as const;
type LabelOption = (typeof LABEL_OPTIONS)[number];

const emptyForm = {
  label: "Home" as LabelOption,
  full_name: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

export default function AddressesModal({ open, onClose }: AddressesModalProps) {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [stateBounds, setStateBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [streetKey, setStreetKey] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getComp = (place: any, type: string) =>
    place.address_components?.find((c: { types: string[]; long_name: string; short_name: string }) => c.types.includes(type));

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    setFetching(true);
    setFetchError("");
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    setFetching(false);
    if (error) { setFetchError(error.message); return; }
    setAddresses((data as Address[]) ?? []);
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchAddresses();
      setShowForm(false);
      setForm(emptyForm);
      setSaveError("");
    }
  }, [open, fetchAddresses]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveError("");
    setSaving(true);
    const { error } = await supabase.from("user_addresses").insert({
      user_id: user.id,
      label: form.label,
      full_name: form.full_name,
      line1: form.line1,
      line2: form.line2 || null,
      city: form.city,
      state: form.state,
      zip: form.zip,
      country: form.country,
      is_default: addresses.length === 0,
    });
    setSaving(false);
    if (error) {
      console.error("[AddressesModal] save error:", error);
      setSaveError(error.message || "Failed to save address. Check Supabase RLS policies.");
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("user_addresses").delete().eq("id", id);
    setDeletingId(null);
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    setDefaultingId(id);
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
    await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", id);
    setDefaultingId(null);
    fetchAddresses();
  };

  const field = (
    id: keyof typeof emptyForm,
    label: string,
    placeholder: string,
    type = "text",
    required = false
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`addr-${id}`} className="text-xs font-semibold text-gray-500">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <input
        id={`addr-${id}`}
        type={type}
        required={required}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
      />
    </div>
  );

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
                className="relative flex items-center gap-4 px-7 py-6"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #E87B3A 100%)" }}
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-tight">Addresses</p>
                  <p className="text-white/60 text-xs mt-0.5">Manage your delivery addresses</p>
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
              <div className="px-7 py-6 flex flex-col gap-4 overflow-y-auto">
                <div className="flex flex-col gap-4">

                  {/* Loading skeleton */}
                  {fetching && (
                    <div className="flex flex-col gap-3" aria-label="Loading addresses">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {!fetching && (fetchError || addresses.length === 0) && !showForm && (
                    <div className="flex flex-col items-center gap-3 py-10">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-semibold text-gray-400">No saved addresses yet</p>
                    </div>
                  )}

                  {/* Address cards */}
                  {!fetching && addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`rounded-2xl border p-4 flex flex-col gap-1.5 relative transition-colors ${
                        addr.is_default ? "border-[#E87B3A]/40 bg-orange-50/40" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2C3A48] text-white">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-[#E87B3A]">
                            <Star className="w-3 h-3 fill-[#E87B3A]" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-[#2C3A48]">{addr.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {addr.city}, {addr.state} {addr.zip}
                      </p>
                      <p className="text-xs text-gray-400">{addr.country}</p>

                      <div className="flex items-center gap-2 mt-2">
                        {!addr.is_default && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            disabled={defaultingId === addr.id}
                            className="text-[11px] font-semibold text-[#2C3A48] hover:text-[#E87B3A] transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {defaultingId === addr.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Star className="w-3 h-3" />
                            )}
                            Set as default
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(addr.id)}
                          disabled={deletingId === addr.id}
                          className="ml-auto text-[11px] font-semibold text-rose-400 hover:text-rose-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                          aria-label={`Delete ${addr.label} address`}
                        >
                          {deletingId === addr.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Inline add form */}
                  <AnimatePresence>
                    {showForm && (
                      <motion.form
                        key="add-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 340, damping: 30 }}
                        onSubmit={handleSave}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl border border-[#E87B3A]/30 bg-orange-50/20 p-4 flex flex-col gap-3">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                            New Address
                          </p>

                          {/* Label pill toggles */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-xs font-semibold text-gray-500">Label</span>
                            <div className="flex gap-2">
                              {LABEL_OPTIONS.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, label: opt }))}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                                    form.label === opt
                                      ? "bg-[#2C3A48] border-[#2C3A48] text-white"
                                      : "bg-white border-gray-200 text-gray-500 hover:border-[#2C3A48] hover:text-[#2C3A48]"
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>

                          {field("full_name", "Full Name", "Jane Smith", "text", true)}

                          {/* Street — fills all fields on selection */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">
                              Address Line 1<span className="text-rose-400 ml-0.5">*</span>
                            </label>
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
                              placeholder="123 Main St"
                              defaultValue={form.line1}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                            />
                          </div>

                          {field("line2", "Address Line 2 (optional)", "Apt 4B")}

                          {/* City + State */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-500">City<span className="text-rose-400 ml-0.5">*</span></label>
                              <Autocomplete
                                key={`city-${resetKey}`}
                                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                                defaultValue={form.city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, city: e.target.value }))}
                                onPlaceSelected={(place) => {
                                  const city = getComp(place, "locality")?.long_name ?? getComp(place, "sublocality_level_1")?.long_name ?? getComp(place, "administrative_area_level_2")?.long_name ?? "";
                                  const state = getComp(place, "administrative_area_level_1")?.short_name ?? "";
                                  setForm((f) => ({ ...f, city, ...(state && { state }) }));
                                  setResetKey((k) => k + 1);
                                }}
                                options={{ types: ["(cities)"], componentRestrictions: { country: "us" } }}
                                placeholder="New York"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-gray-500">State<span className="text-rose-400 ml-0.5">*</span></label>
                              <Autocomplete
                                key={`state-${resetKey}`}
                                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}
                                defaultValue={form.state}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, state: e.target.value }))}
                                onPlaceSelected={(place) => {
                                  const state = getComp(place, "administrative_area_level_1")?.short_name ?? "";
                                  if (state) setForm((f) => ({ ...f, state }));
                                  const vp = place.geometry?.viewport;
                                  if (vp) {
                                    setStateBounds({ north: vp.getNorthEast().lat(), south: vp.getSouthWest().lat(), east: vp.getNorthEast().lng(), west: vp.getSouthWest().lng() });
                                    setStreetKey((k) => k + 1);
                                  }
                                }}
                                options={{ types: ["(regions)"], componentRestrictions: { country: "us" } }}
                                placeholder="NY"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                              />
                            </div>
                          </div>

                          {/* ZIP + Country */}
                          <div className="grid grid-cols-2 gap-3">
                            {field("zip", "ZIP", "10001", "text", true)}
                            {field("country", "Country", "United States")}
                          </div>

                          {saveError && (
                            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 leading-relaxed">
                              {saveError}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <motion.button
                              type="submit"
                              disabled={saving}
                              whileTap={{ scale: 0.97 }}
                              className="flex-1 py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                              {saving ? (
                                <motion.span
                                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                                />
                              ) : "Save Address"}
                            </motion.button>
                            <button
                              type="button"
                              onClick={() => { setShowForm(false); setForm(emptyForm); setSaveError(""); }}
                              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add address button — shown when form is closed */}
                {!showForm && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowForm(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#E87B3A] hover:text-[#E87B3A] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
