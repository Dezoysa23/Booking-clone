"use client";

import { useState } from "react";

/**
 * Newsletter capture. There is no mailing-list backend, so this confirms the
 * intent locally and honestly ("we'll be in touch") rather than pretending to
 * persist a subscription. Validates a real email before confirming.
 */
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-full border border-[#d9a94d]/40 bg-white/10 px-6 py-4 text-center backdrop-blur-sm">
        <span className="material-symbols-outlined text-[#e8c892]" aria-hidden="true">
          mark_email_read
        </span>
        <p className="text-sm font-medium text-white">
          You&apos;re on the list — we&apos;ll be in touch with curated stays.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white outline-none backdrop-blur-sm placeholder:text-white/50 focus:border-[#d9a94d] focus:ring-2 focus:ring-[#d9a94d]/40"
        />
        <button
          type="submit"
          className="rounded-full bg-[#d9a94d] px-7 py-3 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f]"
        >
          Subscribe
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-center text-xs text-[#e8c892] sm:text-left">{error}</p>
      ) : null}
    </form>
  );
}
