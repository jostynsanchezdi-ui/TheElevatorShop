"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Truck, Warehouse, BadgeCheck, HeadphonesIcon,
  Globe, Phone, Mail, ArrowRight, MapPin, Package,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ── Animation helpers ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ── Data ────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: Truck,
    color: "bg-[#E87B3A]",
    title: "Online Shipping Only",
    body: "We deliver directly to your door, anywhere in the country. No pickup required — every order is packaged securely and dispatched from our warehouse with real tracking.",
  },
  {
    icon: Warehouse,
    color: "bg-[#2C3A48]",
    title: "Dedicated Storage Facility",
    body: "Our inventory lives in a climate-controlled warehouse on Long Island City, NY. Parts are organized, inspected, and ready to ship the moment your order is placed.",
  },
  {
    icon: BadgeCheck,
    color: "bg-[#E87B3A]",
    title: "New York State Authorized",
    body: "The Elevator Shop is officially authorized by the State of New York to distribute elevator parts and components, so you can buy with full confidence in compliance and quality.",
  },
  {
    icon: HeadphonesIcon,
    color: "bg-[#2C3A48]",
    title: "No Physical Store",
    body: "We operate 100% online. Reach us by website, phone, or email — our specialists respond fast and guide you to exactly what you need without the hassle of a showroom visit.",
  },
];

const STEPS = [
  {
    number: "01",
    icon: Globe,
    label: "Browse Online",
    description: "Search our full catalog of OEM and aftermarket elevator parts from any device, any time.",
  },
  {
    number: "02",
    icon: Phone,
    label: "Order Your Way",
    description: "Place your order on the website, call us directly, or send an email — whatever works best for you.",
  },
  {
    number: "03",
    icon: Package,
    label: "Shipped to You",
    description: "We pick, pack, and ship from our NY warehouse. You get tracking and delivery to your address.",
  },
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-[#f5f6f8]">

        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 60%, #3a4d60 100%)" }}
        >
          {/* Decorative circles */}
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
                for <span className="text-[#E87B3A]">Elevator Parts</span>,<br />
                Delivered Online.
              </h1>
              <p className="text-sm text-white/60 leading-relaxed max-w-md mb-8">
                The Elevator Shop is a New York State authorized distributor of elevator components — operating 100% online, with a dedicated warehouse and a team ready to help by phone or email.
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
                { label: "NY State Authorized", sub: "Licensed distributor", icon: BadgeCheck, accent: true },
                { label: "Ships Nationwide", sub: "Online orders only", icon: Truck, accent: false },
                { label: "Long Island City, NY", sub: "Warehouse & fulfillment", icon: MapPin, accent: false },
                { label: "Phone · Email · Web", sub: "No physical store", icon: HeadphonesIcon, accent: true },
              ].map(({ label, sub, icon: Icon, accent }) => (
                <div key={label}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl ${accent ? "bg-[#E87B3A]/15 border border-[#E87B3A]/25" : "bg-white/8 border border-white/10"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent ? "bg-[#E87B3A]" : "bg-white/15"}`}>
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

        {/* ── Pillars ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A]">How We Operate</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#2C3A48] leading-tight">
              Built for the Industry,<br />Designed for Convenience
            </h2>
            <p className="mt-4 text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              Everything we do is optimized to get the right elevator part to the right place, fast — with no overhead of a physical storefront.
            </p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {PILLARS.map(({ icon: Icon, color, title, body }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-[#2C3A48] mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-white border-y border-gray-100 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className="text-center mb-14"
            >
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A]">The Process</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-[#2C3A48]">
                Simple. Fast. Reliable.
              </h2>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
            >
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-[#E87B3A]/30 via-[#2C3A48]/20 to-[#E87B3A]/30" />

              {STEPS.map(({ number, icon: Icon, label, description }, i) => (
                <motion.div
                  key={number}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center gap-4"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm ${i % 2 === 0 ? "bg-[#E87B3A]" : "bg-[#2C3A48]"}`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-gray-100 text-[10px] font-extrabold text-[#2C3A48] flex items-center justify-center shadow-sm">
                      {number.replace("0", "")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#2C3A48]">{label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Reach Us ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="bg-[#2C3A48] rounded-3xl overflow-hidden relative"
          >
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E87B3A]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />

            <div className="relative px-8 sm:px-12 py-12 flex flex-col lg:flex-row items-center gap-10">

              {/* Left */}
              <div className="flex-1">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-3 block">
                  Get In Touch
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-3">
                  We're One Message Away
                </h2>
                <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                  No showroom, no waiting room — just fast, knowledgeable support through the channel that works best for you.
                </p>
              </div>

              {/* Right: contact options */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 shrink-0">
                {[
                  { icon: Globe, label: "Online Store", value: "theelevatorshop.com", href: "/" },
                  { icon: Phone, label: "Phone", value: "+1 (800) 555-3825", href: "tel:+18005553825" },
                  { icon: Mail, label: "Email", value: "support@theelevatorshop.com", href: "mailto:support@theelevatorshop.com" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <Link key={label} href={href}
                    className="group flex items-center gap-4 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-2xl transition-all">
                    <div className="w-9 h-9 rounded-xl bg-[#E87B3A] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-semibold text-white group-hover:text-[#E87B3A] transition-colors">{value}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-[#E87B3A] ml-auto transition-colors" />
                  </Link>
                ))}
              </div>

            </div>
          </motion.div>
        </section>

      </main>
      <Footer />
    </>
  );
}
