"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setStatus("error");
      setMessage("Please enter your email and password.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data: { error?: string } = {};
      try {
        data = await response.json();
      } catch {
        setStatus("error");
        setMessage("Server returned an invalid response. Please try again.");
        return;
      }

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data.error || `Login failed (${response.status}). Check your credentials.`,
        );
        return;
      }

      setStatus("success");
      setMessage("Signed in! Redirecting…");
      window.location.href = "/";
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Cannot reach the server. Check your connection.",
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <main className="page-gradient relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden px-4 py-16">
      <div
        className="animate-float-slow pointer-events-none absolute -left-16 top-16 h-48 w-48 rounded-full bg-[#e8c892]/10 blur-2xl"
        aria-hidden="true"
      />
      <div
        className="animate-float-med pointer-events-none absolute -right-10 bottom-16 h-56 w-56 rounded-full bg-[#e8c892]/10 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex flex-col items-center" aria-label="Pearlora — home">
            <Image
              src="/brand/pearlora-logo.jpg"
              alt="Pearlora"
              width={220}
              height={209}
              priority
              className="h-auto w-40 rounded-2xl shadow-[0_12px_30px_rgba(43,32,22,0.2)]"
            />
          </Link>
          <p className="mt-4 text-sm text-on-surface-variant">
            Welcome back — sign in to continue
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-[0_14px_34px_rgba(11,31,58,0.12)]">
          <h1 className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
            Sign In
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Access your bookings and profile.
          </p>

          {message ? (
            <div
              className={`mt-5 rounded-lg border px-4 py-3 text-sm font-medium ${
                status === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message}
            </div>
          ) : null}

          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <Field label="Email Address" htmlFor="email">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                >
                  <span
                    className="material-symbols-outlined text-xl leading-none"
                    aria-hidden="true"
                  >
                    {showPw ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </Field>

            <Button type="submit" fullWidth loading={isLoading}>
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#14213d] transition-colors hover:text-[#101a30]"
            >
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          <span
            className="material-symbols-outlined align-[-3px] text-sm leading-none"
            aria-hidden="true"
          >
            lock
          </span>{" "}
          Secure sign-in — your data is always protected.
        </p>
      </div>
    </main>
  );
}
