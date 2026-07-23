"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubscriptionPlan } from "@prisma/client";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

type Props = {
  plans: SubscriptionPlan[];
  isLoggedIn: boolean;
};

function yearlySavingPct(plan: SubscriptionPlan): number {
  if (plan.monthlyPrice <= 0) return 0;
  return Math.round((1 - plan.yearlyPrice / (plan.monthlyPrice * 12)) * 100);
}

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

  // Derive the best yearly discount from real plan prices (no hardcoded value).
  const bestDiscount = plans.reduce(
    (max, p) => Math.max(max, yearlySavingPct(p)),
    0,
  );

  return (
    <div id="plans">
      {/* Billing toggle */}
      <div className="mb-10 flex justify-center">
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["MONTHLY", "YEARLY"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-lg px-5 py-2 text-sm font-semibold transition-all",
                cycle === c
                  ? "bg-[#14213d] text-white shadow-sm"
                  : "text-slate-500 hover:text-[#14213d]",
              )}
            >
              {c === "MONTHLY" ? "Monthly" : "Yearly"}
              {c === "YEARLY" && bestDiscount > 0 ? (
                <span className="ml-1.5 rounded-full bg-[#d9a94d] px-2 py-0.5 text-[10px] font-bold text-[#14213d]">
                  save {bestDiscount}%
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-5 py-3 text-center text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Plan grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => {
          const isPopular = plans.length > 1 && index === 1;
          const price = cycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
          const monthlyEquiv =
            cycle === "YEARLY"
              ? Math.round(plan.yearlyPrice / 12)
              : plan.monthlyPrice;
          const saving = yearlySavingPct(plan);

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl p-7",
                isPopular
                  ? "section-navy text-white shadow-xl ring-2 ring-[#d9a94d]"
                  : "border border-slate-200/70 bg-white shadow-sm",
              )}
            >
              {isPopular ? (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#d9a94d] px-4 py-1 text-xs font-bold text-[#14213d] shadow">
                    Most Popular
                  </span>
                </div>
              ) : null}

              <div className="mb-6">
                <h3
                  className={cn(
                    "mb-1 font-(family-name:--font-playfair-display) text-xl font-semibold",
                    isPopular ? "text-white" : "text-[#14213d]",
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    isPopular ? "text-white/60" : "text-slate-500",
                  )}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span
                    className={cn(
                      "text-4xl font-bold",
                      isPopular ? "text-white" : "text-[#14213d]",
                    )}
                  >
                    LKR {monthlyEquiv.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      "mb-1 text-sm",
                      isPopular ? "text-white/60" : "text-slate-400",
                    )}
                  >
                    /mo
                  </span>
                </div>
                {cycle === "YEARLY" ? (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      isPopular ? "text-[#e8c892]" : "text-slate-400",
                    )}
                  >
                    LKR {price.toLocaleString()} billed yearly
                    {saving > 0 ? ` · save ${saving}%` : ""}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "mt-2 text-xs",
                    isPopular ? "text-white/60" : "text-slate-500",
                  )}
                >
                  {plan.propertyLimit === -1
                    ? "Unlimited properties"
                    : `Up to ${plan.propertyLimit} ${
                        plan.propertyLimit === 1 ? "property" : "properties"
                      }`}
                </p>
              </div>

              <ul className="mb-8 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span
                      className={cn(
                        "material-symbols-outlined mt-0.5 shrink-0 text-base",
                        isPopular ? "text-[#e8c892]" : "text-[#14213d]",
                      )}
                      aria-hidden="true"
                    >
                      check_circle
                    </span>
                    <span className={isPopular ? "text-white/80" : "text-slate-600"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                loading={loading === plan.id}
                fullWidth
                variant={isPopular ? "accent" : "primary"}
              >
                {loading === plan.id
                  ? "Processing…"
                  : isLoggedIn
                    ? "Get Started"
                    : "Sign up & Subscribe"}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        All prices in Sri Lankan Rupees (LKR). No hidden fees.{" "}
        <Link href="/become-a-host" className="text-[#14213d] hover:underline">
          Learn more
        </Link>
      </p>
    </div>
  );
}
