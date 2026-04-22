"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, ArrowRight, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5f6f8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-16">

          {/* ── Left: copy ── */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-4">
              We&apos;re here to help you
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2C3A48] leading-tight mb-6">
              <span className="text-[#E87B3A]">Get Expert</span> Support
              <br />for Your Elevator
              <br />Parts Needs
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-10">
              Looking for OEM or aftermarket elevator components? Our specialists are ready to help you find the right parts, fast.
            </p>

            <div className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#E87B3A] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">E-mail</p>
                  <p className="text-sm font-semibold text-[#2C3A48]">support@theelevatorshop.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#2C3A48] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone number</p>
                  <p className="text-sm font-semibold text-[#2C3A48]">+1 (800) 555 - 3825</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: form card ── */}
          <div className="w-full lg:w-[460px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center gap-4"
                >
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <h2 className="text-xl font-bold text-[#2C3A48]">Message Sent!</h2>
                  <p className="text-sm text-gray-400 max-w-xs">
                    Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", service: "", message: "" }); }}
                    className="mt-2 text-xs font-semibold text-[#E87B3A] hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                    />
                  </div>

                  {/* Service */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="service" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition appearance-none"
                    >
                      {SERVICES.map((s) => (
                        <option key={s} value={s === SERVICES[0] ? "" : s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Type your message…"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-3 self-start pl-2 pr-6 py-2 bg-[#E87B3A] text-white text-sm font-bold rounded-full overflow-hidden disabled:opacity-70 transition-colors hover:bg-[#d06b2a]"
                  >
                    <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      {loading ? (
                        <motion.span
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                        />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </span>
                    {loading ? "Sending…" : "Get a Solution"}
                  </motion.button>

                </form>
              )}
            </motion.div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
