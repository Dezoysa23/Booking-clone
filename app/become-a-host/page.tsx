import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function BecomeAHostPage() {
  const currentUser = await getCurrentUser();

  const steps = [
    { icon: "person_add", title: "Create your account", body: "Sign up for free and set up your Pearlora host profile in minutes." },
    { icon: "workspace_premium", title: "Choose a plan", body: "Select the subscription tier that matches your property portfolio size." },
    { icon: "apartment", title: "List your property", body: "Add photos, set your nightly price, and publish your listing on Pearlora." },
    { icon: "payments", title: "Start earning", body: "Receive bookings from guests across Sri Lanka and beyond." },
  ];

  const benefits = [
    { icon: "visibility", title: "Reach more guests", body: "Your listings appear on Pearlora's curated search — trusted by thousands of travellers." },
    { icon: "calendar_month", title: "Easy booking management", body: "Track reservations, check-ins, and revenue from one clean dashboard." },
    { icon: "support_agent", title: "Host support", body: "Our team is available to help you set up and grow your listing." },
    { icon: "trending_up", title: "Transparent pricing", body: "Simple flat monthly or yearly plans. No commission cuts per booking." },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#071B63] px-4 pt-20 pb-28 text-center">
        <div className="mx-auto max-w-3xl relative z-10">
          <div className="flex justify-center mb-6">
            <Image src="/brand/pearlora-logo.svg" alt="Pearlora" width={52} height={52} unoptimized className="rounded-xl" />
          </div>
          <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase mb-3">For Property Owners</p>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl md:text-5xl font-semibold text-white leading-tight">
            Become a Pearlora Host
          </h1>
          <p className="mt-5 text-white/60 text-lg max-w-xl mx-auto">
            List your villa, boutique hotel, or holiday home on Sri Lanka&apos;s premium booking platform and start earning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-xl bg-[#D8B45A] px-8 py-4 text-sm font-semibold text-[#071B63] hover:bg-[#c9a84c] transition-colors shadow-lg"
            >
              View Host Plans
            </Link>
            {!currentUser && (
              <Link
                href="/signup"
                className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Create Free Account
              </Link>
            )}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 h-80 w-80 rounded-full bg-white/3 -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#D8B45A]/5 translate-y-1/3 -translate-x-1/4" />
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase mb-2">Simple Process</p>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              How it works
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071B63]">
                    <span className="material-symbols-outlined text-white text-base">{step.icon}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#071B63]/20">0{i + 1}</span>
                </div>
                <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-gray-100 bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase mb-2">Why Pearlora</p>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              Built for Sri Lankan hosts
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-[#faf8f5] p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#071B63]/8">
                  <span className="material-symbols-outlined text-[#071B63] text-base">{b.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0f1f3d] text-sm mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d] mb-3">
            Ready to list?
          </h2>
          <p className="text-gray-500 mb-8">
            Join the growing community of hosts earning through Pearlora.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-xl bg-[#071B63] px-10 py-4 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
          >
            See Pricing Plans
          </Link>
        </div>
      </section>
    </main>
  );
}
