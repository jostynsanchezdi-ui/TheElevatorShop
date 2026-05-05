"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useContactModal } from "@/lib/contact-modal-store";

const SERVICES = [
  "Select a service…",
  "Elevator Parts & Components",
  "Hydraulic Systems",
  "Electrical & Controls",
  "Modernization",
  "Preventive Maintenance",
  "Emergency Repair",
  "Other",
];

export default function ContactModal() {
  const { open, hide } = useContactModal();
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") hide(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [hide]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    timersRef.current.push(setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200));
  };

  const handleClose = () => {
    hide();
    timersRef.current.push(setTimeout(() => { setSubmitted(false); setForm({ name: "", email: "", service: "", message: "" }); }, 300));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Left panel ── */}
              <div
                className="hidden sm:flex flex-col justify-between w-[38%] shrink-0 p-8 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 45%, #E87B3A 100%)" }}
              >
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

                {/* Logo */}
                <div className="relative z-10 flex justify-center pl-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logosigninup.png" alt="The Elevator Shop" width={160} />
                </div>

                {/* Contact info */}
                <div className="relative z-10 flex flex-col gap-5">
                  <div>
                    <p className="text-white/60 text-xs mb-2">We&apos;re here to help you</p>
                    <h2 className="text-white text-xl font-extrabold leading-snug">
                      Get Expert Support<br />for Your Elevator<br />Parts Needs
                    </h2>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E87B3A] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white/50 text-[10px]">E-mail</p>
                        <p className="text-white text-xs font-semibold">sales@theelevatorshop.net</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full border border-white/10" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-white/10" />
              </div>

              {/* ── Right: form ── */}
              <div className="flex-1 flex flex-col justify-center px-7 sm:px-10 py-8 relative">
                <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center gap-4 py-8"
                    >
                      <CheckCircle className="w-14 h-14 text-green-500" />
                      <h2 className="text-xl font-extrabold text-[#2C3A48]">Message Sent!</h2>
                      <p className="text-sm text-gray-400 max-w-xs">Our team will get back to you within 24 hours.</p>
                      <button
                        onClick={() => { setSubmitted(false); setForm({ name: "", email: "", service: "", message: "" }); }}
                        className="mt-1 text-xs font-semibold text-[#E87B3A] hover:underline"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <h1 className="text-xl font-extrabold text-[#2C3A48] mb-1">Get in Touch</h1>
                      <p className="text-xs text-gray-400 mb-6">Fill out the form and we&apos;ll get back to you shortly.</p>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex gap-3">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Name</label>
                            <input name="name" type="text" required value={form.name} onChange={handleChange}
                              placeholder="Jane Smith"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Email</label>
                            <input name="email" type="email" required value={form.email} onChange={handleChange}
                              placeholder="jane@example.com"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-500">Subject</label>
                          <select name="service" value={form.service} onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition appearance-none">
                            {SERVICES.map((s) => (
                              <option key={s} value={s === SERVICES[0] ? "" : s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-500">Message</label>
                          <textarea name="message" required rows={4} value={form.message} onChange={handleChange}
                            placeholder="Type your message…"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition resize-none" />
                        </div>

                        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                          className="relative flex items-center gap-3 self-center pl-2 pr-6 py-2 bg-[#E87B3A] text-white text-sm font-bold rounded-full overflow-hidden disabled:opacity-70 hover:bg-[#d06b2a] transition-colors w-full justify-center">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            {loading ? (
                              <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                                animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                            ) : (
                              <ArrowRight className="w-4 h-4" />
                            )}
                          </span>
                          {loading ? "Sending…" : "Send"}
                        </motion.button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
