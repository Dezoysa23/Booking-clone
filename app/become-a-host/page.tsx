import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { buttonVariants } from "@/components/ui";

export default async function BecomeAHostPage() {
  const currentUser = await getCurrentUser();

  const steps = [
    {
      icon: "person_add",
      title: "Create your account",
      body: "Sign up for free and set up your Pearlora host profile in minutes.",
    },
    {
      icon: "workspace_premium",
      title: "Choose a plan",
      body: "Select the subscription tier that matches your property portfolio size.",
    },
    {
      icon: "apartment",
      title: "List your property",
      body: "Add photos, set your nightly price, and publish your listing on Pearlora.",
    },
    {
      icon: "payments",
      title: "Start earning",
      body: "Receive bookings from guests across Sri Lanka and beyond.",
    },
  ];

  const benefits = [
    {
      icon: "visibility",
      title: "Reach more guests",
      body: "Your listings appear on Pearlora's curated search — trusted by thousands of travellers.",
    },
    {
      icon: "calendar_month",
      title: "Easy booking management",
      body: "Track reservations, check-ins, and revenue from one clean dashboard.",
    },
    {
      icon: "support_agent",
      title: "Host support",
      body: "Our team is available to help you set up and grow your listing.",
    },
    {
      icon: "trending_up",
      title: "Transparent pricing",
      body: "Simple flat monthly or yearly plans. No commission cuts per booking.",
    },
  ];

  return (
    <main className="page-gradient min-h-screen">
      {/* Hero */}
      <section className="section-navy relative overflow-hidden px-4 pb-28 pt-20 text-center">
        <div className="relative z-10 mx-auto max-w-3xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/brand/Pearlora-logo-only.png"
              alt="Pearlora"
              width={52}
              height={52}
              className="rounded-xl"
            />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#e8c892]">
            For Property Owners
          </p>
          <h1 className="font-(family-name:--font-playfair-display) text-4xl font-semibold leading-tight text-white md:text-5xl">
            Become a Pearlora Host
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
            List your villa, boutique hotel, or holiday home on Sri Lanka&apos;s
            premium booking platform and start earning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              View Host Plans
            </Link>
            {!currentUser ? (
              <Link
                href="/signup"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Create Free Account
              </Link>
            ) : null}
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 -translate-y-1/3 translate-x-1/3 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/3 rounded-full bg-[#e8c892]/10" />
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
              Simple Process
            </p>
            <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              How it works
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d]">
                    <span
                      className="material-symbols-outlined text-base text-white"
                      aria-hidden="true"
                    >
                      {step.icon}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-[#14213d]/20">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mb-2 font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-slate-100 bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
              Why Pearlora
            </p>
            <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              Built for Sri Lankan hosts
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex gap-4 rounded-2xl border border-slate-200/70 bg-[#f8f2e9] p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4ecd8]">
                  <span
                    className="material-symbols-outlined text-base text-[#14213d]"
                    aria-hidden="true"
                  >
                    {b.icon}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-[#14213d]">
                    {b.title}
                  </h3>
                  <p className="text-sm text-slate-500">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-3 font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
            Ready to list?
          </h2>
          <p className="mb-8 text-slate-500">
            Join the growing community of hosts earning through Pearlora.
          </p>
          <Link
            href="/pricing"
            className={buttonVariants({ variant: "primary", size: "lg" })}
          >
            See Pricing Plans
          </Link>
        </div>
      </section>
    </main>
  );
}
