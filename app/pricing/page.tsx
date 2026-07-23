import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PricingCards from "@/components/PricingCards";
import { Reveal } from "@/components/Reveal";
import { EmptyState, buttonVariants } from "@/components/ui";

const FAQS = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel your subscription at any time from your billing dashboard. Your access continues until the end of the billing period.",
  },
  {
    q: "What happens when I hit my property limit?",
    a: "You can still manage existing listings, but you won't be able to add new ones until you upgrade to a higher plan.",
  },
  {
    q: "How does yearly billing work?",
    a: "Yearly plans are billed once annually at a discounted rate. You save compared to paying monthly.",
  },
  {
    q: "Is there a free trial?",
    a: "We do not currently offer free trials, but you can cancel your first month within the billing period for a full refund.",
  },
];

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
    <main className="page-gradient min-h-screen">
      {/* Hero */}
      <section className="section-navy px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/brand/Pearlora-logo-only.png"
              alt="Pearlora"
              width={48}
              height={48}
              className="rounded-xl"
            />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e8c892]">
            Host Pricing
          </p>
          <h1 className="font-(family-name:--font-playfair-display) text-4xl font-semibold leading-tight text-white md:text-5xl">
            List your property on Pearlora
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/60">
            Choose the plan that fits your portfolio. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-4 py-16">
        <Reveal className="mx-auto max-w-5xl">
          {plans.length === 0 ? (
            <EmptyState
              icon="workspace_premium"
              title="Plans coming soon"
              description="Pricing plans are not available yet. Please check back soon."
            />
          ) : (
            <PricingCards plans={plans} isLoggedIn={!!currentUser} />
          )}
        </Reveal>
      </section>

      {/* FAQ strip */}
      <section className="border-t border-slate-100 bg-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-slate-200/70 bg-[#f8f2e9] p-5"
              >
                <p className="text-sm font-semibold text-[#14213d]">{q}</p>
                <p className="mt-2 text-sm text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <h2 className="mb-3 font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
          Ready to become a Pearlora host?
        </h2>
        <p className="mb-6 text-sm text-slate-500">
          Join a growing community of hosts earning through Sri Lanka&apos;s
          premium booking platform.
        </p>
        <Link
          href={currentUser ? "#plans" : "/signup"}
          className={buttonVariants({ variant: "primary", size: "lg" })}
        >
          {currentUser ? "Choose a Plan" : "Get Started Free"}
        </Link>
      </section>
    </main>
  );
}
