"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    setMessage("");

    if (!name.trim()) {
      setStatus("error");
      setMessage("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
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
          data.error || `Signup failed (${response.status}). Please try again.`,
        );
        return;
      }

      setStatus("success");
      setMessage("Account created! Signing you in…");
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
            Create your account to start booking
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-[0_14px_34px_rgba(11,31,58,0.12)]">
          <h1 className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join Pearlora and unlock extraordinary stays.
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
              handleSignup();
            }}
          >
            <Field label="Full Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={isLoading}
              />
            </Field>

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

            <Field label="Password" htmlFor="password" hint="Minimum 8 characters.">
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#14213d] transition-colors hover:text-[#101a30]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
