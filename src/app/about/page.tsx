"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Truck, Mail, ArrowRight, MapPin, CheckCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const SUBJECTS = [
  "Select a subject…",
  "Elevator Parts & Components",
  "Hydraulic Systems",
  "Electrical & Controls",
  "Modernization",
  "Preventive Maintenance",
  "Emergency Repair",
  "Other",
];

export default function AboutPage() {
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  return (
    <>
      <Header />
      <main className="bg-[#f5f6f8]">

        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #3a4d60 100%)" }}
        >
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#E87B3A]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col lg:flex-row items-center gap-12">

            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex-1"
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-4">
                Who We Are
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
                Your Trusted Source<br />
                for <span className="text-[#E87B3A]">Elevator Parts</span> online,<br />
                Delivered to you.
              </h1>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mb-8">
                The Elevator Shop is a New York State authorized distributor of elevator components — operating 100% online, with a dedicated warehouse and a team ready to help you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E87B3A] text-white text-sm font-bold rounded-full hover:bg-[#d46d2f] transition-colors">
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-colors">
                  Browse Parts
                </Link>
              </div>
            </motion.div>

            {/* Right: stat pills */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="flex flex-col gap-4 w-full lg:w-72 shrink-0"
            >
              {[
                { label: "Ships Nationwide", sub: "Online orders only", icon: Truck },
                { label: "Long Island City, NY", sub: "Warehouse & fulfillment", icon: MapPin },
              ].map(({ label, sub, icon: Icon }) => (
                <div key={label}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/8 border border-white/10">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-white/50">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* ── Contact Form ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-16">

          {/* Left: copy */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="flex-1 min-w-0"
          >
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-4">
              Get In Touch
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2C3A48] leading-tight mb-6">
              <span className="text-[#E87B3A]">Get Expert</span> Support
              <br />for Your Elevator
              <br />Parts Needs
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-10">
              Looking for OEM or aftermarket elevator components? Our specialists are ready to help you find the right parts, fast.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#E87B3A] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">E-mail</p>
                <p className="text-sm font-semibold text-[#2C3A48]">sales@theelevatorshop.net</p>
              </div>
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="w-full lg:w-[460px] shrink-0"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
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

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ab-name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
                    <input id="ab-name" name="name" type="text" required value={form.name} onChange={handleChange}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ab-email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                    <input id="ab-email" name="email" type="email" required value={form.email} onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ab-service" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
                    <select id="ab-service" name="service" value={form.service} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition appearance-none">
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s === SUBJECTS[0] ? "" : s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ab-message" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message</label>
                    <textarea id="ab-message" name="message" required rows={4} value={form.message} onChange={handleChange}
                      placeholder="Type your message…"
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition resize-none" />
                  </div>

                  <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-3 self-start pl-2 pr-6 py-2 bg-[#E87B3A] text-white text-sm font-bold rounded-full overflow-hidden disabled:opacity-70 transition-colors hover:bg-[#d06b2a]">
                    <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
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
              )}
            </div>
          </motion.div>

        </section>

      </main>
      <Footer />
    </>
  );
}
