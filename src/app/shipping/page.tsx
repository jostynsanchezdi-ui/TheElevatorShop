"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Truck, Clock, CalendarDays, PackageCheck, AlertTriangle,
  RotateCcw, ShieldCheck, ArrowRight, MapPin, Phone, Mail,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function ShippingPolicyPage() {
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

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-4">
                Policies
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
                Shipping &amp; Return Policy
              </h1>
              <p className="text-sm text-white/60 leading-relaxed max-w-xl mx-auto">
                We ship nationwide from our Long Island City, NY warehouse. Read below for full details on processing times, delivery windows, and our return guidelines.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Quick Stats ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10 mb-16">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { icon: Clock, label: "Same-Day Processing", sub: "When payment clears" },
              { icon: CalendarDays, label: "3–5 Business Days", sub: "Standard delivery" },
              { icon: MapPin, label: "Ships from LIC, NY", sub: "Long Island City 11101" },
              { icon: Truck, label: "Nationwide Delivery", sub: "All 50 states" },
            ].map(({ icon: Icon, label, sub }) => (
              <motion.div
                key={label}
                variants={fadeUp}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E87B3A]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#E87B3A]" />
                </div>
                <p className="text-xs font-bold text-[#2C3A48] leading-tight">{label}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Shipping Policy ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#2C3A48] flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E87B3A]">Section 01</span>
                <h2 className="text-xl font-extrabold text-[#2C3A48]">Shipping Policy</h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">

              {/* Processing */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-[#E87B3A]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <PackageCheck className="w-4.5 h-4.5 text-[#E87B3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Order Processing</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    All orders are processed <span className="font-semibold text-[#2C3A48]">the same business day</span> that payment is confirmed. Once your payment clears, our warehouse team immediately picks, inspects, and packs your order for shipment. Orders placed after business hours or on weekends will be processed on the next business day.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Delivery window */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-[#2C3A48]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CalendarDays className="w-4.5 h-4.5 text-[#2C3A48]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Delivery Timeframe</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    Delivery is completed within <span className="font-semibold text-[#2C3A48]">3–5 business days</span> after your payment is received. Business days are Monday through Friday — <span className="font-semibold text-[#2C3A48]">Saturdays and Sundays are not counted</span> as business days, nor are federally observed holidays.
                  </p>
                  <div className="bg-[#f5f6f8] rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
                    <p className="font-semibold text-[#2C3A48] mb-1">Example</p>
                    <p>If your payment is confirmed on a Wednesday, your order ships that same day and is expected to arrive by the following Wednesday at the latest — typically sooner for nearby states.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Carrier & tracking */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-[#E87B3A]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4.5 h-4.5 text-[#E87B3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Carriers &amp; Tracking</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    We ship via major carriers (UPS, FedEx, USPS) based on package size, weight, and destination. A tracking number will be provided by email once your shipment is dispatched. You can use that number on the carrier&apos;s website to follow your package in real time.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Packaging */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-[#2C3A48]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <PackageCheck className="w-4.5 h-4.5 text-[#2C3A48]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Packaging &amp; Handling</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Every order is individually inspected before packing. Elevator components are fragile and precision-sensitive — we use industry-appropriate packaging materials (foam inserts, double-boxing for heavy parts) to ensure your parts arrive in perfect condition. If your package arrives visibly damaged, please photograph it before opening and contact us immediately.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Delays */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Potential Delays</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    While we fulfill every order the same day payment is received, delivery timeframes are carrier-dependent and may occasionally be affected by weather, carrier volume, or remote delivery areas. We recommend placing orders with sufficient lead time for critical maintenance situations.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* ── Return Policy ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E87B3A] flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-[0.15em] uppercase text-[#E87B3A]">Section 02</span>
                <h2 className="text-xl font-extrabold text-[#2C3A48]">Return Policy</h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">

              {/* General rule */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">General Rule — All Sales Final</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    The vast majority of elevator parts and components sold by The Elevator Shop are <span className="font-semibold text-[#2C3A48]">non-returnable</span>. Due to the safety-critical nature of elevator components, parts that have been installed, handled in a non-factory manner, or whose original packaging has been altered cannot be accepted back under any circumstances. Please verify part numbers and compatibility before placing your order.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Eligible returns */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Eligible Returns — Functional Defects</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    A return and full refund may be authorized exclusively for products that exhibit a <span className="font-semibold text-[#2C3A48]">confirmed manufacturer defect or functional failure</span> upon first use. Eligible situations include:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "The part arrives in a non-functional state due to a manufacturing fault.",
                      "The part fails on first installation despite correct application per spec.",
                      "The wrong item was shipped (our error — incorrect SKU or part number).",
                      "The product is physically damaged in a way attributable to inadequate packaging.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E87B3A] mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Process */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-[#E87B3A]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <RotateCcw className="w-4.5 h-4.5 text-[#E87B3A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Return Process</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    To initiate a return, contact us within <span className="font-semibold text-[#2C3A48]">7 days of delivery</span>. Returns requested outside this window will not be accepted. Our team will review your case and, if approved, provide a prepaid return label.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { step: "01", label: "Contact Support", desc: "Email or call us within 7 days with your order number and a description of the defect." },
                      { step: "02", label: "Send Evidence", desc: "Provide clear photos or a short video of the defect. Our team reviews within 1 business day." },
                      { step: "03", label: "Refund Issued", desc: "If approved, a prepaid return label is sent. Refund is processed within 5–7 business days of receipt." },
                    ].map(({ step, label, desc }) => (
                      <div key={step} className="bg-[#f5f6f8] rounded-xl p-4">
                        <span className="text-[10px] font-extrabold tracking-widest text-[#E87B3A] uppercase">{step}</span>
                        <p className="text-xs font-bold text-[#2C3A48] mt-1 mb-1.5">{label}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-50" />

              {/* Non-eligible */}
              <div className="flex gap-5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3A48] mb-1.5">Non-Eligible Returns</h3>
                  <ul className="space-y-2">
                    {[
                      "Change of mind or ordering the wrong part (verify compatibility before purchase).",
                      "Parts that have been installed, modified, or show signs of use.",
                      "Damage caused by improper installation or use outside of manufacturer specifications.",
                      "Returns requested more than 7 days after the delivery date.",
                      "Items without original packaging or missing documentation.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="bg-[#2C3A48] rounded-3xl overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#E87B3A]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/3 translate-x-1/3" />
            <div className="relative px-8 sm:px-12 py-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#E87B3A] mb-2 block">Questions?</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight mb-2">
                  We&apos;re Here to Help
                </h2>
                <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                  If you have any questions about your shipment or need to report a defective item, reach out — we respond fast.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                {[
                  { icon: Phone, label: "Phone", value: "+1 (800) 555-3825", href: "tel:+18005553825" },
                  { icon: Mail, label: "Email", value: "support@theelevatorshop.com", href: "mailto:support@theelevatorshop.com" },
                ].map(({ icon: Icon, label, value, href }) => (
                  <Link key={label} href={href}
                    className="group flex items-center gap-4 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 rounded-2xl transition-all">
                    <div className="w-8 h-8 rounded-xl bg-[#E87B3A] flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-white" />
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
