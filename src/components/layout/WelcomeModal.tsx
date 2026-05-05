"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";
import { useAuthModal } from "@/lib/auth-modal-store";

const STORAGE_KEY = "tes_welcome_seen";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const authModal = useAuthModal();

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full relative"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-10 pb-8">
              <h2 className="text-2xl font-bold text-[#2C3A48] mb-2 text-center">
                Welcome to The Elevator Shop
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-8">
                Browse our catalog, add items to your cart, and submit a{" "}
                <span className="font-semibold text-[#2C3A48]">Purchase Order (PO)</span> — our team will follow up with payment and shipping details.
              </p>

              {/* Create account CTA */}
              <button
                onClick={() => { dismiss(); authModal.open("register"); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2C3A48] text-white text-sm font-bold hover:bg-[#1e2a35] transition-colors mb-3"
              >
                <UserPlus className="w-4 h-4" />
                Create an Account
              </button>

              {/* Benefits hint */}
              <p className="text-xs text-gray-400 text-center mb-5">
                Create an account to track your POs and save your information for faster ordering.
              </p>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Continue as guest */}
              <button
                onClick={dismiss}
                className="w-full py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-500 hover:border-[#2C3A48] hover:text-[#2C3A48] transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
