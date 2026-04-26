"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, User, Phone, Building2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AccountModal({ open, onClose }: AccountModalProps) {
  const { user, setUser } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);
  const [form, setForm] = useState({ full_name: "", phone: "", company: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        full_name: (user.user_metadata?.full_name as string) ?? "",
        phone:     (user.user_metadata?.phone     as string) ?? "",
        company:   (user.user_metadata?.company   as string) ?? "",
      });
    }
  }, [user]);

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
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.auth.updateUser({
      data: {
        full_name: form.full_name,
        phone:     form.phone,
        company:   form.company,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data.user) setUser(data.user);
    setSaved(true);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  };

  const initials = form.full_name
    ? form.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

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
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="relative flex items-center gap-4 px-7 py-6"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #E87B3A 100%)" }}
              >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-white font-extrabold text-base leading-tight">
                    {form.full_name || "My Account"}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="px-7 py-6 flex flex-col gap-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest -mb-1">
                  Personal Information
                </p>

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                  />
                </div>

                {/* Email — locked */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Email Address
                    <span className="ml-auto text-[10px] font-medium text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full">Cannot be changed</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed select-none"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Company
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    placeholder="Acme Elevator Co."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                  />
                </div>

                {error && <p className="text-xs text-rose-500 -mt-1">{error}</p>}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                  ) : saved ? (
                    <><Check className="w-4 h-4" /> Saved</>
                  ) : "Save Changes"}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
