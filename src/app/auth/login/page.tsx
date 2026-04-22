"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuth((s) => s.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (authError) {
      if (authError.message.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email address before signing in. Check your inbox for the confirmation link.");
      } else {
        setError(authError.message);
      }
      return;
    }
    if (data.user) {
      setUser(data.user);
      const redirectTo = searchParams.get("redirectTo") ?? "/";
      router.push(redirectTo);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex min-h-[560px]">

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
            <p className="text-white/60 text-sm mb-2">Welcome back</p>
            <h2 className="text-white text-2xl font-extrabold leading-snug">
              Your elevator parts,<br />one login away.
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

          <h1 className="text-2xl font-extrabold text-[#2C3A48] mb-1">Sign in to your account</h1>
          <p className="text-sm text-gray-400 mb-8">
            Access your orders, wishlist, and saved parts.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Your email</label>
              <input
                name="email" type="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <Link href="#" className="text-xs text-[#E87B3A] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  name="password" type={showPassword ? "text" : "password"} required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <motion.button
              type="submit" disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
              ) : "Sign In"}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-6">
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

          <p className="text-xs text-gray-400 text-center mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-[#E87B3A] font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
