"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { useAuthModal } from "@/lib/auth-modal-store";
import { supabase } from "@/lib/supabase";

export default function AuthModal() {
  const { mode, close, open } = useAuthModal();
  const isOpen = mode !== null;

  // Login state
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginDone, setLoginDone] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [regError, setRegError] = useState("");

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoginLoading(false);
    if (error) { setLoginError(error.message); return; }
    setLoginDone(true);
    setTimeout(() => { setLoginDone(false); close(); }, 2200);
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) return;
    setRegError("");
    setRegLoading(true);
    const { error } = await supabase.auth.signUp({
      email: regForm.email,
      password: regForm.password,
      options: { data: { full_name: regForm.name } },
    });
    setRegLoading(false);
    if (error) { setRegError(error.message); return; }
    setRegDone(true);
  };

  const switchToRegister = () => { setRegDone(false); open("register"); };
  const switchToLogin = () => { open("login"); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40"
            onClick={close}
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
              style={{ minHeight: "500px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Left gradient panel ── */}
              <div
                className="hidden sm:flex flex-col justify-between w-[38%] shrink-0 p-8 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #1a2535 0%, #2C3A48 45%, #E87B3A 100%)" }}
              >
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
                <div className="relative z-10 flex justify-center pl-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logosigninup.png" alt="The Elevator Shop" width={160} />
                </div>
                <div className="relative z-10">
                  <p className="text-white/60 text-xs mb-2">
                    {mode === "login" ? "Welcome back" : "Join us today"}
                  </p>
                  <h2 className="text-white text-xl font-extrabold leading-snug">
                    {mode === "login"
                      ? "Your elevator parts,\none login away."
                      : "OEM parts, fast\nshipping, and\nexpert support."}
                  </h2>
                </div>
                <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full border border-white/10" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full border border-white/10" />
              </div>

              {/* ── Right form panel ── */}
              <div className="flex-1 flex flex-col justify-center px-7 sm:px-10 py-8 relative">
                {/* Close button */}
                <button onClick={close} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>


                {/* ── LOGIN SUCCESS OVERLAY ── */}
                <AnimatePresence>
                  {loginDone && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-r-3xl gap-3"
                    >
                      <motion.svg width="64" height="64" viewBox="0 0 56 56" fill="none" className="drop-shadow-lg">
                        <motion.circle cx="28" cy="28" r="24" stroke="white" strokeWidth="2.5" fill="rgba(40,167,69,0.85)"
                          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.45, ease: "easeOut" }} strokeLinecap="round" />
                        <motion.path d="M17 28.5L24.5 36L39 21" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut", delay: 0.3 }} />
                      </motion.svg>
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.2 }}
                        className="text-center"
                      >
                        <p className="text-base font-extrabold text-[#2C3A48]">Authentication Successful</p>
                        <p className="text-xs text-gray-400 mt-1">Welcome back to The Elevator Shop</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {/* ── LOGIN ── */}
                  {mode === "login" && (
                    <motion.div key="login" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
                      <h1 className="text-xl font-extrabold text-[#2C3A48] mb-1">Sign in to your account</h1>
                      <p className="text-xs text-gray-400 mb-6">Access your orders, wishlist, and saved parts.</p>
                      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-500">Your email</label>
                          <input name="email" type="email" required value={loginForm.email}
                            onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="you@example.com"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-500">Password</label>
                            <button type="button" className="text-xs text-[#E87B3A] hover:underline">Forgot password?</button>
                          </div>
                          <div className="relative">
                            <input name="password" type={showLoginPw ? "text" : "password"} required value={loginForm.password}
                              onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                              placeholder="••••••••••"
                              className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                            <button type="button" onClick={() => setShowLoginPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        {loginError && (
                          <p className="text-xs text-rose-500 -mt-1">{loginError}</p>
                        )}
                        <motion.button type="submit" disabled={loginLoading} whileTap={{ scale: 0.97 }}
                          className="w-full py-2.5 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1">
                          {loginLoading
                            ? <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                            : "Sign In"}
                        </motion.button>
                      </form>
                      <Divider />
                      <SocialButtons />
                      <p className="text-xs text-gray-400 text-center mt-5">
                        Don&apos;t have an account?{" "}
                        <button onClick={switchToRegister} className="text-[#E87B3A] font-semibold hover:underline">Sign up</button>
                      </p>
                    </motion.div>
                  )}

                  {/* ── REGISTER ── */}
                  {mode === "register" && !regDone && (
                    <motion.div key="register" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                      <h1 className="text-xl font-extrabold text-[#2C3A48] mb-1">Create an account</h1>
                      <p className="text-xs text-gray-400 mb-6">Access parts, track orders, and manage your wishlist.</p>
                      <form onSubmit={handleRegSubmit} className="flex flex-col gap-3">
                        <div className="flex gap-3">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Full name</label>
                            <input name="name" type="text" required value={regForm.name}
                              onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="Jane Smith"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Email</label>
                            <input name="email" type="email" required value={regForm.email}
                              onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                              placeholder="you@example.com"
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Password</label>
                            <div className="relative">
                              <input name="password" type={showRegPw ? "text" : "password"} required value={regForm.password}
                                onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                                placeholder="••••••••••"
                                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A] transition" />
                              <button type="button" onClick={() => setShowRegPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showRegPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500">Confirm</label>
                            <div className="relative">
                              <input name="confirm" type={showConfirm ? "text" : "password"} required value={regForm.confirm}
                                onChange={(e) => setRegForm((f) => ({ ...f, confirm: e.target.value }))}
                                placeholder="••••••••••"
                                className={`w-full px-4 py-2.5 pr-10 rounded-xl border bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition ${regForm.confirm && regForm.password !== regForm.confirm ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-[#E87B3A]/30 focus:border-[#E87B3A]"}`} />
                              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {regForm.confirm && regForm.password !== regForm.confirm && (
                              <p className="text-[10px] text-rose-500">Passwords don&apos;t match</p>
                            )}
                          </div>
                        </div>
                        {regError && (
                          <p className="text-xs text-rose-500 -mt-1">{regError}</p>
                        )}
                        <motion.button type="submit" disabled={regLoading} whileTap={{ scale: 0.97 }}
                          className="w-full py-2.5 rounded-xl bg-[#E87B3A] text-white text-sm font-bold hover:bg-[#d06b2a] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 mt-1">
                          {regLoading
                            ? <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full block" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                            : "Get Started"}
                        </motion.button>
                      </form>
                      <Divider />
                      <SocialButtons />
                      <p className="text-xs text-gray-400 text-center mt-4">
                        Already have an account?{" "}
                        <button onClick={switchToLogin} className="text-[#E87B3A] font-semibold hover:underline">Sign in</button>
                      </p>
                    </motion.div>
                  )}

                  {/* ── REGISTER SUCCESS ── */}
                  {mode === "register" && regDone && (
                    <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-4 py-6">
                      <motion.svg width="60" height="60" viewBox="0 0 56 56" fill="none">
                        <motion.circle cx="28" cy="28" r="24" stroke="#22c55e" strokeWidth="2.5" fill="rgba(34,197,94,0.1)"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} strokeLinecap="round" />
                        <motion.path d="M17 28.5L24.5 36L39 21" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"
                          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.4 }} />
                      </motion.svg>
                      <h2 className="text-xl font-extrabold text-[#2C3A48]">Account created!</h2>
                      <p className="text-sm text-gray-400">Welcome to The Elevator Shop.</p>
                      <button onClick={switchToLogin} className="mt-1 px-6 py-2.5 bg-[#2C3A48] text-white text-sm font-bold rounded-xl hover:bg-[#1e2a35] transition-colors">
                        Sign In Now
                      </button>
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

function Divider() {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400">or continue with</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="flex gap-2">
      {/* Google */}
      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
        <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.1-6.1C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.1 5.52C12.4 13.67 17.73 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.7c-.55 2.98-2.2 5.5-4.67 7.2l7.18 5.57C43.27 37.27 46.52 31.36 46.52 24.5z"/>
          <path fill="#FBBC05" d="M10.74 28.26A14.6 14.6 0 0 1 9.5 24c0-1.48.26-2.91.74-4.26l-7.1-5.52A23.93 23.93 0 0 0 0 24c0 3.87.93 7.53 2.56 10.76l8.18-6.5z"/>
          <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.57C28.6 38.3 26.44 39 24 39c-6.27 0-11.6-4.17-13.26-9.74l-8.18 6.5C6.07 43.52 14.44 47 24 47z"/>
        </svg>
        <span className="text-sm font-semibold text-gray-700">Google</span>
      </button>

      {/* Facebook */}
      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#1877F2] hover:bg-[#1464d8] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
        <span className="text-sm font-semibold text-white">Facebook</span>
      </button>
    </div>
  );
}
