"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
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
        setMessage(data.error || `Signup failed (${response.status}). Please try again.`);
        return;
      }

      setStatus("success");
      setMessage("Account created! Signing you in...");
      window.location.href = "/";
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? `Error: ${err.message}`
          : "Cannot reach the server. Check your connection."
      );
    }
  };

  const isLoading = status === "loading";

  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#0f1f3d]">
            <span className="text-[#D8B45A] text-lg">✦</span>
            <span className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold">
              Pearlora
            </span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Create your account to start booking</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d]">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Join Pearlora and unlock extraordinary stays.
          </p>

          {/* Status banner — always visible when set */}
          {message && (
            <div
              className={`mt-5 rounded-lg px-4 py-3 text-sm font-medium border ${
                status === "error"
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-green-50 border-green-300 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#0f1f3d] focus:bg-white focus:ring-2 focus:ring-[#0f1f3d]/10"
                placeholder="Your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#0f1f3d] focus:bg-white focus:ring-2 focus:ring-[#0f1f3d]/10"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#0f1f3d] focus:bg-white focus:ring-2 focus:ring-[#0f1f3d]/10"
                placeholder="Minimum 8 characters"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-400">Minimum 8 characters.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#0f1f3d] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
