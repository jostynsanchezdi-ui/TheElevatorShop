"use client";

import { useState } from "react";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900 rounded-2xl px-8 py-10 sm:px-12 flex flex-col md:flex-row gap-10 items-center">
          {/* Left copy */}
          <div className="flex-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
              Ready to Get <br />
              New Parts?
            </h2>
            {submitted ? (
              <p className="text-sm text-green-400 font-medium">
                Thanks! We&apos;ll be in touch soon.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                >
                  Send
                </button>
              </form>
            )}
          </div>

          {/* Right copy */}
          <div className="flex-1 max-w-sm">
            <p className="text-sm font-semibold text-gray-300 mb-2">
              TheElevatorShop for Industry Needs
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              We&apos;ll listen to your requirements, identify the best
              components, and source the exact elevator parts that fit your
              application — fast.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
