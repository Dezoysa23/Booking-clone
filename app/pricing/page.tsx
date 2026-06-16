import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PricingCards from "@/components/PricingCards";

export default async function PricingPage() {
  const currentUser = await getCurrentUser();

  // If already a host, redirect to billing
  if (currentUser?.role === "HOST") {
    redirect("/host/billing");
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: "asc" },
  });

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="bg-[#071B63] px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="flex justify-center mb-6">
            <Image src="/brand/pearlora-logo.jpg" alt="Pearlora" width={48} height={48} unoptimized className="rounded-xl" />
          </div>
          <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase mb-3">Host Pricing</p>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl md:text-5xl font-semibold text-white leading-tight">
            List your property on Pearlora
          </h1>
          <p className="mt-4 text-white/60 text-lg max-w-xl mx-auto">
            Choose the plan that fits your portfolio. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          {plans.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Pricing plans are not available yet. Please check back soon.</p>
            </div>
          ) : (
            <PricingCards plans={plans} isLoggedIn={!!currentUser} />
          )}
        </div>
      </section>

      {/* FAQ strip */}
      <section className="border-t border-gray-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              { q: "Can I cancel anytime?", a: "Yes. Cancel your subscription at any time from your billing dashboard. Your access continues until the end of the billing period." },
              { q: "What happens when I hit my property limit?", a: "You can still manage existing listings, but you won't be able to add new ones until you upgrade to a higher plan." },
              { q: "How does yearly billing work?", a: "Yearly plans are billed once annually at a discounted rate. You save compared to paying monthly." },
              { q: "Is there a free trial?", a: "We do not currently offer free trials, but you can cancel your first month within the billing period for a full refund." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-gray-100 bg-[#faf8f5] p-5">
                <p className="font-semibold text-[#0f1f3d] text-sm">{q}</p>
                <p className="mt-2 text-sm text-gray-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d] mb-3">
          Ready to become a Pearlora host?
        </h2>
        <p className="text-gray-500 text-sm mb-6">Join hundreds of hosts earning through Sri Lanka&apos;s premium booking platform.</p>
        <Link
          href={currentUser ? "#plans" : "/signup"}
          className="inline-block rounded-xl bg-[#071B63] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
        >
          {currentUser ? "Choose a Plan" : "Get Started Free"}
        </Link>
      </section>
    </main>
  );
}
