"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnimatedBackgroundOrbs from "@/components/ui/AnimatedBackgroundOrbs";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${"*".repeat(local.length)}@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits]           = useState<string[]>(["", "", "", "", "", ""]);
  const [status, setStatus]           = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage]         = useState("");
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resendLoading, setResendLoading]     = useState(false);
  const [resendMessage, setResendMessage]     = useState("");

  const inputRefs   = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setResendCountdown(seconds);
    countdownRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (!email) { router.replace("/signup"); return; }
    startCountdown(60);
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 120);
    return () => {
      clearTimeout(t);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [email, router, startCountdown]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setMessage("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits]; next[index - 1] = ""; setDigits(next);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft"  && index > 0) inputRefs.current[index - 1]?.focus();
    else if   (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
    else if   (e.key === "Enter")                    handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) { setStatus("error"); setMessage("Please enter all 6 digits."); return; }
    setStatus("loading"); setMessage("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      let data: { error?: string } = {};
      try { data = await res.json(); } catch { /* ignore */ }
      if (!res.ok) { setStatus("error"); setMessage(data.error ?? "Verification failed. Please try again."); return; }
      setStatus("success");
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setStatus("error"); setMessage("Cannot reach the server. Check your connection.");
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || resendLoading) return;
    setResendLoading(true); setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setResendMessage("A new code has been sent to your email.");
        setDigits(["", "", "", "", "", ""]);
        startCountdown(60);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      } else {
        const d = await res.json().catch(() => ({})) as { error?: string };
        setResendMessage(d.error ?? "Failed to resend. Please try again.");
      }
    } catch { setResendMessage("Cannot reach the server."); }
    finally  { setResendLoading(false); }
  };

  const isLoading    = status === "loading";
  const codeComplete = digits.every((d) => d !== "");

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden bg-[#faf8f5] min-h-screen">
      <AnimatedBackgroundOrbs />

      <div className="relative z-10 w-full max-w-[420px] auth-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 text-[#0f1f3d]">
            <Image src="/brand/pearlora-logo.jpg" alt="Pearlora" width={34} height={34} className="rounded-lg" unoptimized />
            <span className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold">Pearlora</span>
          </Link>
          <p className="mt-2 text-sm text-gray-400">Email Verification</p>
        </div>

        {/* Glass card */}
        <div className="glass-panel rounded-2xl shadow-xl px-8 py-9">

          {status === "success" ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center text-center py-2">
              {/* Key unlock visual */}
              <div className="relative mb-5">
                {/* Pulse ring */}
                <div
                  className="auth-pulse-ring absolute inset-0 rounded-full"
                  style={{ background: "rgba(216,180,90,0.18)" }}
                />
                <div
                  className="relative h-20 w-20 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(216,180,90,0.15), rgba(216,180,90,0.05))",
                    border: "2px solid rgba(216,180,90,0.4)",
                    animation: "pearlora-scale-in 0.5s ease both",
                  }}
                >
                  <span
                    className="material-symbols-outlined filled text-[#D8B45A] text-4xl"
                    style={{ animation: "pearlora-fade-up 0.4s ease 0.25s both" }}
                  >
                    key
                  </span>
                </div>
                {/* Sparkles */}
                <span className="absolute -top-1 -right-0.5 text-[#D8B45A] text-sm"
                  style={{ animation: "pearlora-sparkle 0.5s ease 0.55s both" }}>✦</span>
                <span className="absolute -bottom-0.5 -left-1 text-[#D8B45A] text-[10px]"
                  style={{ animation: "pearlora-sparkle 0.5s ease 0.7s both" }}>✦</span>
              </div>

              <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d]">
                Account Unlocked
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Your email has been verified.<br />Signing you in to Pearlora…
              </p>
              <div className="mt-4 h-1 w-20 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#D8B45A] rounded-full"
                  style={{ animation: "pearlora-fade-up 2s linear both", width: "100%" }}
                />
              </div>
            </div>
          ) : (
            /* ── Verification form ── */
            <>
              {/* Animated envelope */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="auth-pulse-ring absolute inset-0 rounded-full bg-[#071B63]/8" />
                  <div
                    className="auth-envelope relative h-14 w-14 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: "linear-gradient(135deg, #0f1f3d, #071B63)" }}
                  >
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" aria-hidden="true">
                      <rect x="0.75" y="0.75" width="22.5" height="18.5" rx="2.25" stroke="#D8B45A" strokeWidth="1.5" fill="none" />
                      <path d="M0.75 3.5L12 11.5L23.25 3.5" stroke="#D8B45A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d] text-center">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-gray-500 text-center leading-relaxed">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-[#0f1f3d]">{maskEmail(email)}</span>
              </p>

              {/* Error banner */}
              {message && status === "error" && (
                <div className="mt-4 rounded-xl px-4 py-3 text-sm font-medium border bg-red-50 border-red-200 text-red-700">
                  {message}
                </div>
              )}

              {/* Resend feedback */}
              {resendMessage && (
                <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium border ${
                  resendMessage.startsWith("A new") ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
                }`}>
                  {resendMessage}
                </div>
              )}

              {/* OTP inputs */}
              <div className="mt-7 flex gap-2.5 justify-center" role="group" aria-label="Verification code">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="\d"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    disabled={isLoading}
                    aria-label={`Digit ${i + 1}`}
                    className={`otp-input h-14 w-11 rounded-xl border-2 text-center text-xl font-bold text-[#0f1f3d] outline-none
                      ${digit ? "border-[#071B63] bg-[#071B63]/5" : "border-gray-200 bg-gray-50/80"}
                      ${status === "error" ? "border-red-300" : ""}
                      disabled:opacity-50`}
                  />
                ))}
              </div>

              <p className="mt-2.5 text-center text-xs text-gray-400">
                Enter the 6-digit code from your email
              </p>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={isLoading || !codeComplete}
                className="mt-5 w-full rounded-xl px-4 py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #071B63 60%, #123EAF 100%)" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              {/* Resend */}
              <p className="mt-5 text-center text-sm text-gray-500">
                Didn&apos;t receive a code?{" "}
                <button
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || resendLoading}
                  className="font-semibold text-[#071B63] hover:text-[#D8B45A] transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Sending…" : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
                </button>
              </p>

              <div className="mt-5 pt-5 border-t border-gray-100 text-center">
                <Link href="/signup" className="text-xs text-gray-400 hover:text-[#0f1f3d] transition-colors">
                  ← Back to sign up
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
          Having trouble? Check your spam folder or{" "}
          <Link href="/login" className="text-[#0f1f3d] font-medium hover:text-[#D8B45A] transition-colors">
            sign in
          </Link>{" "}
          if you&apos;ve already verified.
        </p>
      </div>
    </main>
  );
}
