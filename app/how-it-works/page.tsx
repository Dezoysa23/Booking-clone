import Link from "next/link";
import { buttonVariants } from "@/components/ui";

const TRAVELER_STEPS = [
  {
    step: "01",
    icon: "search",
    title: "Search your destination",
    description:
      "Enter your destination, travel dates, and number of guests in the search bar to discover available properties.",
  },
  {
    step: "02",
    icon: "tune",
    title: "Filter and compare",
    description:
      "Narrow results by price range, guest capacity, rating, and location to find the stay that fits your needs.",
  },
  {
    step: "03",
    icon: "photo_library",
    title: "Explore property details",
    description:
      "Browse the full image gallery, read the description, check amenities, and review guest ratings before deciding.",
  },
  {
    step: "04",
    icon: "calendar_month",
    title: "Choose your dates",
    description:
      "Select check-in and check-out dates. Already-booked periods are shown clearly so you can book with confidence.",
  },
  {
    step: "05",
    icon: "check_circle",
    title: "Book instantly",
    description:
      "Complete your reservation in seconds. You'll receive an email confirmation with all your booking details.",
  },
  {
    step: "06",
    icon: "luggage",
    title: "Manage from your account",
    description:
      "View, track, and cancel bookings at any time from the My Bookings page. Reminder emails are sent 24 hours before check-in.",
  },
];

const HOST_STEPS = [
  {
    step: "01",
    icon: "person_add",
    title: "Create your account",
    description:
      "Sign up for a Pearlora account and verify your email address to get started as a host.",
  },
  {
    step: "02",
    icon: "workspace_premium",
    title: "Choose a subscription plan",
    description:
      "Select a hosting plan that matches your needs — from a single listing to unlimited properties.",
  },
  {
    step: "03",
    icon: "add_home",
    title: "List your properties",
    description:
      "Upload photos, write a description, set your price per night, amenities, and guest capacity.",
  },
  {
    step: "04",
    icon: "event_available",
    title: "Manage bookings",
    description:
      "Review incoming bookings from your host dashboard and keep track of check-in and check-out dates.",
  },
  {
    step: "05",
    icon: "bar_chart",
    title: "Track performance",
    description:
      "Monitor your properties' booking rates, revenue, and guest reviews directly from your host portal.",
  },
];

const ADMIN_STEPS = [
  {
    step: "01",
    icon: "group",
    title: "Review users",
    description:
      "Manage all registered users, review roles, and monitor account activity from the admin dashboard.",
  },
  {
    step: "02",
    icon: "apartment",
    title: "Manage properties",
    description:
      "Create, edit, and remove property listings. Ensure all listings meet Pearlora's quality standards.",
  },
  {
    step: "03",
    icon: "receipt_long",
    title: "Track bookings",
    description:
      "Monitor all bookings across the platform, view statuses, and handle any disputes or cancellations.",
  },
  {
    step: "04",
    icon: "payments",
    title: "Monitor payments",
    description:
      "Track subscription payments, view revenue reports, and manage host subscription statuses.",
  },
];

type StepCardProps = {
  step: string;
  icon: string;
  title: string;
  description: string;
  accentColor: string;
};

function StepCard({
  step,
  icon,
  title,
  description,
  accentColor,
}: StepCardProps) {
  return (
    <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}14` }}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ color: accentColor }}
            aria-hidden="true"
          >
            {icon}
          </span>
        </div>
        <span
          className="font-(family-name:--font-playfair-display) text-4xl font-bold leading-none opacity-10"
          style={{ color: accentColor }}
        >
          {step}
        </span>
      </div>
      <h3 className="font-(family-name:--font-playfair-display) text-base font-semibold leading-snug text-[#14213d]">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="page-gradient min-h-screen">
      {/* Hero */}
      <section className="section-navy px-4 py-20 text-center md:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[#e8c892]/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c892]">
              Your Complete Guide
            </span>
            <span className="h-px w-10 bg-[#e8c892]/60" />
          </div>
          <h1 className="mb-5 font-(family-name:--font-playfair-display) text-4xl font-semibold text-white md:text-5xl">
            How Pearlora Works
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
            Whether you&apos;re looking for your next getaway or listing a
            property, Pearlora makes it simple and secure.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 md:px-6">
        {/* For Travellers */}
        <section>
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ecd8]">
                <span
                  className="material-symbols-outlined text-lg text-[#14213d]"
                  aria-hidden="true"
                >
                  travel_explore
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9a94d]">
                For Travellers
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              Find &amp; book your perfect stay
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
              From search to check-in — here&apos;s how to book with Pearlora in
              six easy steps.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRAVELER_STEPS.map((s) => (
              <StepCard key={s.step} {...s} accentColor="#14213d" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/results?destination="
              className={buttonVariants({ variant: "primary" })}
            >
              Start Searching
            </Link>
            <Link
              href="/bookings"
              className={buttonVariants({ variant: "outline" })}
            >
              View My Bookings
            </Link>
          </div>
        </section>

        <div className="divider-gold" />

        {/* For Hosts */}
        <section>
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4ecd8]">
                <span
                  className="material-symbols-outlined text-lg text-[#c4922f]"
                  aria-hidden="true"
                >
                  home_work
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d9a94d]">
                For Hosts
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              List &amp; manage your properties
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
              Turn your property into income. Here&apos;s how to get started as a
              Pearlora host.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOST_STEPS.map((s) => (
              <StepCard key={s.step} {...s} accentColor="#c4922f" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/become-a-host"
              className={buttonVariants({ variant: "accent" })}
            >
              Become a Host
            </Link>
            <Link
              href="/pricing"
              className={buttonVariants({ variant: "outline" })}
            >
              View Plans
            </Link>
          </div>
        </section>

        <div className="divider-gold" />

        {/* For Admins */}
        <section>
          <div className="mb-10">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <span
                  className="material-symbols-outlined text-lg text-emerald-600"
                  aria-hidden="true"
                >
                  admin_panel_settings
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                For Admins
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              Manage the platform
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
              The admin panel gives super admins full visibility and control
              across the entire platform.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADMIN_STEPS.map((s) => (
              <StepCard key={s.step} {...s} accentColor="#059669" />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
