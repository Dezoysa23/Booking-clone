"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

function passwordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (pw.length === 0) return { level: 0, label: "" };
  if (pw.length < 8)   return { level: 1, label: "Too short" };
  if (pw.length < 12)  return { level: 2, label: "Weak" };
  if (pw.length < 16 || !/[^a-zA-Z0-9]/.test(pw)) return { level: 3, label: "Good" };
  return { level: 3, label: "Strong" };
}

const STRENGTH_COLORS = ["bg-gray-200", "bg-red-400", "bg-amber-400", "bg-emerald-500"];
const STRENGTH_TEXT   = ["", "text-red-500", "text-amber-500", "text-emerald-600"];

const TRUST_BADGES = [
  { icon: "verified_user",  label: "Verified Stays"   },
  { icon: "lock",           label: "Bank-grade SSL"   },
  { icon: "support_agent",  label: "24/7 Support"     },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [status, setStatus]       = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]     = useState("");

  const strength = passwordStrength(password);

  const handleSignup = async () => {
    setMessage("");
    if (!name.trim()) { setStatus("error"); setMessage("Please enter your full name."); return; }
    if (password.length < 8) { setStatus("error"); setMessage("Password must be at least 8 characters."); return; }
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      let data: { error?: string; needsVerification?: boolean; email?: string } = {};
      try { data = await res.json(); } catch {
        setStatus("error"); setMessage("Invalid server response. Please try again."); return;
      }
      if (!res.ok) { setStatus("error"); setMessage(data.error ?? "Signup failed. Please try again."); return; }
      setStatus("success");
      setMessage("Account created! Sending verification code…");
      router.push(`/verify-email?email=${encodeURIComponent(data.email ?? email.trim().toLowerCase())}`);
    } catch {
      setStatus("error"); setMessage("Cannot reach the server. Check your connection.");
    }
  };

  const isLoading = status === "loading";

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden py-12 px-4"
      style={{ background: "linear-gradient(155deg, #101A30 0%, #14213D 48%, #16233F 100%)" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="auth-orb-1 absolute -top-40 -right-32 h-[520px] w-[520px] rounded-full bg-[#2A3A5C]/18 blur-3xl" />
        <div className="auth-orb-2 absolute -bottom-28 -left-28 h-[400px] w-[400px] rounded-full bg-[#D9A94D]/9 blur-3xl" />
        <div className="auth-orb-3 absolute top-1/3 left-1/3 h-72 w-72 rounded-full bg-[#16233F]/16 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] auth-fade-up">

        {/* Logo */}
        <Link href="/" className="flex flex-col items-center mb-9 group">
          <div className="mb-3.5 rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Image
              src="/brand/pearlora-logo.jpg"
              alt="Pearlora"
              width={80}
              height={80}
              className="block"
              unoptimized
            />
          </div>
          <span className="font-[family-name:var(--font-playfair-display)] text-[30px] font-semibold text-white tracking-wide group-hover:text-[#D9A94D] transition-colors duration-200">
            Pearlora
          </span>
          <p className="text-white/35 text-[11px] mt-1.5 tracking-[0.18em] uppercase">
            Sri Lanka&apos;s Premier Stays
          </p>
        </Link>

        {/* Form card */}
        <div
          className="rounded-2xl px-8 py-9 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
        >
          <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#14213D]">
            Create Account
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Join Pearlora and unlock extraordinary stays.
          </p>

          {/* Status banner */}
          {message && (
            <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium border ${
              status === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {message}
            </div>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
          >
            {/* Full name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10 hover:border-gray-300"
                placeholder="Your full name"
                disabled={isLoading}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10 hover:border-gray-300"
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10 hover:border-gray-300"
                  placeholder="Minimum 8 characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPw ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                          strength.level >= i ? STRENGTH_COLORS[strength.level] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[11px] font-medium shrink-0 ${STRENGTH_TEXT[strength.level]}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #14213D 0%, #14213D 60%, #16233F 100%)" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Trust micro-row */}
          <div className="mt-5 flex items-center justify-center gap-4">
            {[
              { icon: "verified_user", text: "Verified email required" },
              { icon: "lock",          text: "Encrypted & secure"       },
            ].map(({ icon, text }) => (
              <span key={text} className="flex items-center gap-1 text-[11px] text-gray-400">
                <span className="material-symbols-outlined text-[13px] text-emerald-500">{icon}</span>
                {text}
              </span>
            ))}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust row */}
        <div className="mt-6 flex items-center justify-center gap-5 flex-wrap">
          {TRUST_BADGES.map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-white/35 text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-[#D9A94D]/60">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
