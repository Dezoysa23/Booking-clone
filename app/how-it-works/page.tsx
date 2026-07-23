import Link from "next/link";

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

function StepCard({ step, icon, title, description, accentColor }: StepCardProps) {
  return (
    <div className="relative rounded-2xl bg-white border border-gray-100 shadow-sm p-7 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ color: accentColor }}
          >
            {icon}
          </span>
        </div>
        <span
          className="font-[family-name:var(--font-playfair-display)] text-4xl font-bold opacity-10 leading-none"
          style={{ color: accentColor }}
        >
          {step}
        </span>
      </div>
      <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D] leading-snug">
        {title}
      </h3>
      <p className="text-sm text-[#5B6472] leading-relaxed">{description}</p>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#F8F2E9]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#14213D] to-[#16233F] px-4 md:px-16 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-[#D9A94D]/60" />
            <span className="text-[#D9A94D] text-xs font-semibold tracking-[0.2em] uppercase">
              Your Complete Guide
            </span>
            <span className="h-px w-10 bg-[#D9A94D]/60" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl md:text-5xl font-semibold text-white mb-5">
            How Pearlora Works
          </h1>
          <p className="text-white/65 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Whether you&apos;re looking for your next getaway or listing a property,
            Pearlora makes it simple and secure.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-16 space-y-20">
        {/* For Travellers */}
        <section>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#14213D]/8">
                <span className="material-symbols-outlined text-[#14213D] text-lg">travel_explore</span>
              </div>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D9A94D]">
                For Travellers
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              Find &amp; book your perfect stay
            </h2>
            <p className="mt-2 text-sm text-[#5B6472] max-w-lg leading-relaxed">
              From search to check-in — here&apos;s how to book with Pearlora in six easy steps.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRAVELER_STEPS.map((s) => (
              <StepCard key={s.step} {...s} accentColor="#14213D" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/results?destination="
              className="rounded-full bg-[#14213D] px-7 py-3 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors"
            >
              Start Searching
            </Link>
            <Link
              href="/bookings"
              className="rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View My Bookings
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* For Hosts */}
        <section>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9A94D]/10">
                <span className="material-symbols-outlined text-[#D9A94D] text-lg">home_work</span>
              </div>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D9A94D]">
                For Hosts
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              List &amp; manage your properties
            </h2>
            <p className="mt-2 text-sm text-[#5B6472] max-w-lg leading-relaxed">
              Turn your property into income. Here&apos;s how to get started as a Pearlora host.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOST_STEPS.map((s) => (
              <StepCard key={s.step} {...s} accentColor="#B8860B" />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/become-a-host"
              className="rounded-full bg-[#D9A94D] px-7 py-3 text-sm font-semibold text-[#14213D] hover:bg-[#c99a3f] transition-colors"
            >
              Become a Host
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-gray-200 bg-white px-7 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View Plans
            </Link>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* For Admins */}
        <section>
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
                <span className="material-symbols-outlined text-emerald-600 text-lg">admin_panel_settings</span>
              </div>
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-emerald-600">
                For Admins
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              Manage the platform
            </h2>
            <p className="mt-2 text-sm text-[#5B6472] max-w-lg leading-relaxed">
              The admin panel gives super admins full visibility and control across the entire platform.
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
