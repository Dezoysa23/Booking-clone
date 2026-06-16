"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TRUST_BADGES = [
  { icon: "verified_user",  label: "Verified Stays"   },
  { icon: "lock",           label: "Bank-grade SSL"   },
  { icon: "support_agent",  label: "24/7 Support"     },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [status, setStatus]         = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]       = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setStatus("error"); setMessage("Please enter your email and password."); return;
    }
    setStatus("loading"); setMessage(""); setPendingEmail("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      let data: { error?: string; needsVerification?: boolean; email?: string } = {};
      try { data = await res.json(); } catch {
        setStatus("error"); setMessage("Invalid server response. Please try again."); return;
      }
      if (!res.ok) {
        if (data.needsVerification && data.email) {
          setStatus("error");
          setMessage(data.error ?? "Please verify your email before signing in.");
          setPendingEmail(data.email);
          return;
        }
        setStatus("error"); setMessage(data.error ?? "Login failed. Check your credentials."); return;
      }
      setStatus("success"); setMessage("Signed in! Redirecting…");
      router.push("/");
    } catch {
      setStatus("error"); setMessage("Cannot reach the server. Check your connection.");
    }
  };

  const isLoading = status === "loading";

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden py-12 px-4"
      style={{ background: "linear-gradient(155deg, #060f22 0%, #071B63 48%, #0d1e48 100%)" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="auth-orb-1 absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#1D63D8]/18 blur-3xl" />
        <div className="auth-orb-2 absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-[#D8B45A]/9 blur-3xl" />
        <div className="auth-orb-3 absolute top-1/2 right-1/3 h-80 w-80 rounded-full bg-[#123EAF]/16 blur-3xl" />
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
          <span className="font-[family-name:var(--font-playfair-display)] text-[30px] font-semibold text-white tracking-wide group-hover:text-[#D8B45A] transition-colors duration-200">
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
          <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to continue your journey.
          </p>

          {/* Status banner */}
          {message && (
            <div className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium border ${
              status === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {message}
              {pendingEmail && (
                <div className="mt-2.5">
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(pendingEmail)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#071B63] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#123EAF] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">mark_email_read</span>
                    Verify Email Now
                  </Link>
                </div>
              )}
            </div>
          )}

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          >
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10 hover:border-gray-300"
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
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10 hover:border-gray-300"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  autoComplete="current-password"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #071B63 60%, #123EAF 100%)" }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#071B63] hover:text-[#D8B45A] transition-colors">
              Sign up free
            </Link>
          </p>
        </div>

        {/* Trust row */}
        <div className="mt-6 flex items-center justify-center gap-5 flex-wrap">
          {TRUST_BADGES.map(({ icon, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-white/35 text-[11px]">
              <span className="material-symbols-outlined text-[14px] text-[#D8B45A]/60">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
