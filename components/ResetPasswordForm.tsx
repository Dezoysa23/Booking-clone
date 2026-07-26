"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Your password has been reset. Redirecting to sign in…");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setStatus("error");
      setMessage("Cannot reach the server. Check your connection.");
    }
  };

  const isLoading = status === "loading";
  const isDone = status === "success";

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden py-12 px-4"
      style={{ background: "linear-gradient(155deg, #101A30 0%, #14213D 48%, #16233F 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="auth-orb-1 absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-[#2A3A5C]/18 blur-3xl" />
        <div className="auth-orb-2 absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-[#D9A94D]/9 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] auth-fade-up">
        <Link href="/" className="flex flex-col items-center mb-9 group">
          <div className="mb-3.5 rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Image src="/brand/pearlora-logo.jpg" alt="Pearlora" width={80} height={80} className="block" unoptimized />
          </div>
          <span className="font-[family-name:var(--font-playfair-display)] text-[30px] font-semibold text-white tracking-wide group-hover:text-[#D9A94D] transition-colors duration-200">
            Pearlora
          </span>
        </Link>

        <div
          className="rounded-2xl px-8 py-9 border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.55)]"
          style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)" }}
        >
          <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#14213D]">
            Choose a new password
          </h1>
          <p className="mt-1.5 text-sm text-[#5B6472]">
            Set a strong password you don&apos;t use elsewhere.
          </p>

          {message && (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium border ${
                status === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {message}
            </div>
          )}

          {!token ? (
            <div className="mt-6 text-sm text-[#5B6472]">
              This reset link is missing or invalid.{" "}
              <Link href="/forgot-password" className="font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors">
                Request a new one
              </Link>
              .
            </div>
          ) : (
            !isDone && (
              <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 pr-11 text-sm outline-none transition-all focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10 hover:border-gray-300"
                      placeholder="At least 8 characters"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C879B] hover:text-[#3B4658] transition-colors"
                      tabIndex={-1}
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPw ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10 hover:border-gray-300"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg, #14213D 0%, #14213D 60%, #16233F 100%)" }}
                >
                  {isLoading ? "Resetting…" : "Reset password"}
                </button>
              </form>
            )
          )}

          <p className="mt-5 text-center text-sm text-[#5B6472]">
            <Link href="/login" className="font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
