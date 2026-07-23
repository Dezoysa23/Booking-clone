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
    <div className="min-h-screen bg-[#F8F2E9] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-100 shadow-sm p-10 text-center">
        <div className="flex justify-center mb-6">
          <Image
            src="/brand/pearlora-logo.jpg"
            alt="Pearlora"
            width={40}
            height={40}
            unoptimized
            className="rounded-lg"
          />
        </div>

        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#14213D]/20 border-t-[#14213D]" />
            <h1 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
              Confirming payment…
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we activate your subscription.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 border border-green-100">
              <span className="material-symbols-outlined text-green-600 text-2xl">
                check_circle
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
              Subscription Activated!
            </h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/host/dashboard"
                className="block w-full rounded-lg bg-[#14213D] py-3 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors"
              >
                Go to Host Dashboard
              </Link>
              <button
                onClick={() => router.refresh()}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Refresh page
              </button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 border border-red-100">
              <span className="material-symbols-outlined text-red-600 text-2xl">
                error
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
            <Link
              href="/pricing"
              className="mt-6 block w-full rounded-lg bg-[#14213D] py-3 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors"
            >
              Back to Pricing
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
