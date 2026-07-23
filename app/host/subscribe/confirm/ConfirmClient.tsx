"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ConfirmClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscription_id");
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    subscriptionId ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    subscriptionId ? "" : "Invalid confirmation link."
  );
  const didRun = useRef(false);

  useEffect(() => {
    if (!subscriptionId) return;
    if (didRun.current) return;
    didRun.current = true;

    fetch("/api/host/subscribe/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, sessionId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Your subscription is now active. Welcome to Pearlora as a host!");
        } else {
          setStatus("error");
          setMessage(data.error || "Activation failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, [subscriptionId, sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/70 shadow-sm p-10 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/brand/Pearlora-logo-only.png"
            alt="Pearlora"
            width={40}
            height={40}
            className="rounded-lg"
          />
        </div>

        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#14213d]/20 border-t-[#14213d]" />
            <h1 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
              Confirming payment…
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we activate your subscription.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">
                check_circle
              </span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
              Subscription Activated!
            </h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/host/dashboard"
                className="block w-full rounded-lg bg-[#14213d] py-3 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
              >
                Go to Host Dashboard
              </Link>
              <button
                onClick={() => router.refresh()}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100">
              <span className="material-symbols-outlined text-rose-600 text-2xl">
                error
              </span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link
              href="/pricing"
              className="mt-6 block w-full rounded-lg bg-[#14213d] py-3 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
            >
              Back to Pricing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
