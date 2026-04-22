"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
      },
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[580px]">

        {/* ── Left panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[42%] shrink-0 p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 40%, #E87B3A 100%)" }}
        >
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

          <div className="relative z-10">
            <Image src="/logo.png" alt="The Elevator Shop" width={140} height={42} unoptimized className="brightness-0 invert opacity-90" />
          </div>

          <div className="relative z-10">
            <p className="text-white/60 text-sm mb-2">Join us today</p>
            <h2 className="text-white text-2xl font-extrabold leading-snug">
              Get access to OEM<br />parts, fast shipping,<br />and expert support.
            </h2>
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full border border-white/10" />
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-10">
          <div className="w-8 h-8 rounded-lg bg-[#E87B3A] flex items-center justify-center mb-6">
            <span className="text-white font-black text-lg leading-none">✦</span>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
              <h1 className="text-2xl font-extrabold text-[#2C3A48]">Check your email</h1>
              <p className="text-sm text-gray-400 leading-relaxed">
                We sent a confirmation link to <span className="font-semibold text-[#2C3A48]">{form.email}</span>. Click it to activate your account, then sign in.
              </p>
              <Link href="/auth/login"
                className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-[#2C3A48] text-white text-sm font-bold rounded-xl hover:bg-[#1e2a35] transition-colors w-fit">
                Go to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-[#2C3A48] mb-1">Create an account</h1>
              <p className="text-sm text-gray-400 mb-7">
                Access parts, track orders, and manage your wishlist.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Full name</label>
                  <input name="name" type="text" required value={form.name} onChange={handleChange}
                    placeholder="Jane Smith"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Your email</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Password</label>
                  <div className="relative">
                    <input name="password" type={showPassword ? "text" : "password"} required value={form.password} onChange={handleChange}
                      placeholder="••••••••••" minLength={6}
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Confirm password</label>
                  <div className="relative">
                    <input name="confirm" type={showConfirm ? "text" : "password"} required value={form.confirm} onChange={handleChange}
                      placeholder="••••••••••"
                      className={`w-full px-4 py-3 pr-11 rounded-xl border bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition ${form.confirm && form.password !== form.confirm ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A]"}`} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <p className="text-xs text-rose-500">Passwords don&apos;t match</p>
                  )}
                </div>

                {error && (
                  <p className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <motion.button type="submit" disabled={loading || (!!form.confirm && form.password !== form.confirm)} whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl bg-[#E87B3A] text-white text-sm font-bold hover:bg-[#d06b2a] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1">
                  {loading ? (
                    <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                      animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                  ) : "Get Started"}
                </motion.button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="flex gap-3">
                {[
                  { label: "G", bg: "bg-white border border-gray-200", text: "text-[#EA4335]", title: "Google" },
                  { label: "f", bg: "bg-[#1877F2]", text: "text-white", title: "Facebook" },
                  { label: "in", bg: "bg-[#0A66C2]", text: "text-white", title: "LinkedIn" },
                ].map(({ label, bg, text, title }) => (
                  <button key={title} title={title}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold ${bg} ${text} hover:opacity-80 transition-opacity`}>
                    {label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center mt-5">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#E87B3A] font-semibold hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
