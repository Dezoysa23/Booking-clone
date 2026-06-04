"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@prisma/client";

type Props = {
  plans: SubscriptionPlan[];
  isLoggedIn: boolean;
};

export default function PricingCards({ plans, isLoggedIn }: Props) {
  const router = useRouter();
  const [cycle, setCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId: string) => {
    if (!isLoggedIn) {
      router.push("/signup?next=/pricing");
      return;
    }

    setError("");
    setLoading(planId);

    try {
      const res = await fetch("/api/host/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, billingCycle: cycle }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start subscription.");
        return;
      }

      router.push(data.checkoutUrl);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const yearlyDiscount = 17;

  return (
    <div id="plans">
      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {(["MONTHLY", "YEARLY"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                cycle === c
                  ? "bg-[#071B63] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#071B63]"
              }`}
            >
              {c === "MONTHLY" ? "Monthly" : `Yearly`}
              {c === "YEARLY" && (
                <span className="ml-1.5 rounded-full bg-[#D8B45A] px-2 py-0.5 text-[10px] font-bold text-[#071B63]">
                  -{yearlyDiscount}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-5 py-3 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      {/* Plan grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => {
          const isPopular = index === 1;
          const price = cycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
          const monthlyEquiv = cycle === "YEARLY" ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-7 ${
                isPopular
                  ? "bg-[#071B63] text-white ring-2 ring-[#D8B45A] shadow-xl"
                  : "bg-white border border-gray-100 shadow-sm"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#D8B45A] px-4 py-1 text-xs font-bold text-[#071B63] shadow">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-[family-name:var(--font-playfair-display)] text-xl font-semibold mb-1 ${isPopular ? "text-white" : "text-[#0f1f3d]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${isPopular ? "text-white/60" : "text-gray-500"}`}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-bold ${isPopular ? "text-white" : "text-[#0f1f3d]"}`}>
                    LKR {monthlyEquiv.toLocaleString()}
                  </span>
                  <span className={`text-sm mb-1 ${isPopular ? "text-white/60" : "text-gray-400"}`}>/mo</span>
                </div>
                {cycle === "YEARLY" && (
                  <p className={`text-xs mt-1 ${isPopular ? "text-[#D8B45A]" : "text-gray-400"}`}>
                    LKR {price.toLocaleString()} billed yearly
                  </p>
                )}
                <p className={`text-xs mt-2 ${isPopular ? "text-white/60" : "text-gray-500"}`}>
                  {plan.propertyLimit === -1 ? "Unlimited properties" : `Up to ${plan.propertyLimit} ${plan.propertyLimit === 1 ? "property" : "properties"}`}
                </p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className={`material-symbols-outlined text-base mt-0.5 shrink-0 ${isPopular ? "text-[#D8B45A]" : "text-[#071B63]"}`}>
                      check_circle
                    </span>
                    <span className={isPopular ? "text-white/80" : "text-gray-600"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isPopular
                    ? "bg-[#D8B45A] text-[#071B63] hover:bg-[#c9a84c]"
                    : "bg-[#071B63] text-white hover:bg-[#123EAF]"
                }`}
              >
                {loading === plan.id ? "Processing…" : isLoggedIn ? "Get Started" : "Sign up & Subscribe"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        All prices in Sri Lankan Rupees (LKR). No hidden fees.{" "}
        <Link href="/become-a-host" className="text-[#071B63] hover:underline">Learn more</Link>
      </p>
    </div>
  );
}
