import Image from "next/image";
import Link from "next/link";
import type { Property } from "@prisma/client";
import SearchBox from "@/components/SearchBox";
import PropertyCard from "@/components/PropertyCard";
import DestinationCard from "@/components/DestinationCard";
import { prisma } from "@/lib/prisma";

const DESTINATIONS = [
  {
    title: "Galle",
    subtitle: "Colonial coast & golden sands",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Galle",
  },
  {
    title: "Ella",
    subtitle: "Misty peaks & tea estates",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Ella",
  },
  {
    title: "Mirissa",
    subtitle: "Palm beaches & blue horizons",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Mirissa",
  },
  {
    title: "Kandy",
    subtitle: "Culture, temples & cool air",
    image:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Kandy",
  },
];

export default async function Home() {
  let featuredProperties: Property[] = [];
  try {
    featuredProperties = await prisma.property.findMany({
      orderBy: [{ rating: "desc" }, { id: "asc" }],
      take: 3,
    });
  } catch (error) {
    console.error("[Home] Failed to fetch featured properties:", error);
  }

  return (
    <div className="bg-[#faf8f5]">
      {/* ─── Hero ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto pt-6 md:pt-8">
        {/* Image container — overflow-hidden here ONLY clips the hero image to rounded corners */}
        <div className="relative w-full h-[460px] md:h-[600px] rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(15,31,61,0.18)]">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2069&auto=format&fit=crop"
            alt="Pearlora — Luxury stays across Sri Lanka"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          {/* Gradient overlay + heading — sits entirely within the image container */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f3d]/65 via-[#0f1f3d]/20 to-[#0f1f3d]/78 flex flex-col justify-center items-center text-center px-6 pb-12">
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <span className="hidden sm:block h-px w-12 bg-[#D8B45A]/60" />
              <div className="flex items-center gap-2">
                <span className="text-[#D8B45A] text-sm">✦</span>
                <span className="text-[#D8B45A] text-xs font-semibold tracking-[0.2em] uppercase">
                  Sri Lanka&apos;s Premier Booking Platform
                </span>
                <span className="text-[#D8B45A] text-sm">✦</span>
              </div>
              <span className="hidden sm:block h-px w-12 bg-[#D8B45A]/60" />
            </div>

            <h1
              className="font-[family-name:var(--font-playfair-display)] text-white max-w-3xl mb-4 leading-tight font-semibold"
              style={{ fontSize: "clamp(1.9rem, 5vw, 3.75rem)" }}
            >
              Discover Your Perfect Stay in Sri Lanka
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-xl leading-relaxed">
              From Coastlines to Hilltops — Pearlora curates extraordinary stays
              for the discerning traveller.
            </p>
          </div>
        </div>

        {/* Search box — outside the overflow-hidden container so it is never clipped.
            Negative margin creates the floating-over-hero visual overlap. */}
        <div className="mx-auto max-w-4xl -mt-8 md:-mt-10 relative z-10">
          <SearchBox />
        </div>
      </section>

      {/* ─── Trust Pillars ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mt-14 md:mt-16 mb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6 flex items-start gap-4 hover:border-[#D8B45A]/40 hover:shadow-md transition-all duration-200">
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#071B63]/10 to-[#071B63]/5">
              <span className="material-symbols-outlined text-[#071B63] text-xl">
                verified
              </span>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">
                Curated by Experts
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Every property is handpicked and vetted for quality, comfort,
                and character.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6 flex items-start gap-4 hover:border-[#D8B45A]/40 hover:shadow-md transition-all duration-200">
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D8B45A]/15 to-[#D8B45A]/5">
              <span className="material-symbols-outlined text-[#B8860B] text-xl">
                lock
              </span>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">
                Secure &amp; Simple
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Book with confidence. Your data and reservations are always
                protected.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-6 flex items-start gap-4 hover:border-[#D8B45A]/40 hover:shadow-md transition-all duration-200">
            <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
              <span className="material-symbols-outlined text-emerald-600 text-xl">
                map
              </span>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">
                Sri Lanka Specialists
              </h3>
              <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                Deep local knowledge — from Galle to Sigiriya, we know every
                hidden gem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Popular Destinations ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#D8B45A]" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D8B45A]">
                Explore Sri Lanka
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#0f1f3d]">
              Popular Destinations
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
              Discover handpicked locations — each one a story waiting to be
              written.
            </p>
          </div>
          <Link
            href="/results?destination="
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors tracking-wide"
          >
            Browse all
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.title} {...dest} />
          ))}
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/results?destination="
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors"
          >
            Browse all destinations
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Featured Stays ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#D8B45A]" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D8B45A]">
                Handpicked for You
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#0f1f3d] max-w-lg">
              Featured Stays
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
              Exceptional properties selected for comfort, location, and
              character.
            </p>
          </div>
          <Link
            href="/results?destination="
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors tracking-wide"
          >
            View all
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                name={property.name}
                location={property.location}
                rating={property.rating}
                price={property.price}
                image={property.image}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-400 text-sm">
              Properties coming soon. Check back shortly.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/results?destination="
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors"
          >
            View all properties
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-[#D8B45A]" />
              <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D8B45A]">
                Simple &amp; Transparent
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#0f1f3d]">
              How Pearlora Works
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
              Whether you&apos;re booking a stay or listing a property, getting started takes just a few steps.
            </p>
          </div>
          <Link
            href="/how-it-works"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors tracking-wide"
          >
            Full guide
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* For Travellers */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#071B63]/8">
                <span className="material-symbols-outlined text-[#071B63] text-xl">travel_explore</span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D8B45A]">For Travellers</p>
                <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
                  Find &amp; book your perfect stay
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: "search", label: "Search your destination" },
                { icon: "tune", label: "Filter by price, guests &amp; rating" },
                { icon: "calendar_month", label: "Choose available dates" },
                { icon: "check_circle", label: "Book instantly &amp; get a confirmation" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#071B63] text-lg">{item.icon}</span>
                  <span className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: item.label }} />
                </div>
              ))}
            </div>
            <Link
              href="/results?destination="
              className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#071B63] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
            >
              Start Searching
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* For Hosts */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0f1f3d] to-[#1a3a6b] border border-[#D8B45A]/20 shadow-sm p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D8B45A]/15">
                <span className="material-symbols-outlined text-[#D8B45A] text-xl">home_work</span>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#D8B45A]">For Hosts</p>
                <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-white">
                  List &amp; manage your properties
                </h3>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { icon: "person_add", label: "Create your account" },
                { icon: "workspace_premium", label: "Choose a subscription plan" },
                { icon: "add_home", label: "Upload photos &amp; set your price" },
                { icon: "bar_chart", label: "Track bookings &amp; performance" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#D8B45A] text-lg">{item.icon}</span>
                  <span className="text-sm text-white/75" dangerouslySetInnerHTML={{ __html: item.label }} />
                </div>
              ))}
            </div>
            <Link
              href="/become-a-host"
              className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#D8B45A] px-6 py-2.5 text-sm font-semibold text-[#0f1f3d] hover:bg-[#c9a84c] transition-colors"
            >
              Become a Host
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#0f1f3d] hover:text-[#D8B45A] transition-colors"
          >
            Read the full guide
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ─── Brand CTA ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <div className="relative rounded-3xl bg-[#0f1f3d] overflow-hidden px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Decorative concentric rings */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-[#D8B45A]/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full border border-[#D8B45A]/10" />
          <div className="pointer-events-none absolute -right-2 -top-2 h-36 w-36 rounded-full border border-[#D8B45A]/10" />

          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center gap-2.5 mb-3 justify-center md:justify-start">
              <Image
                src="/brand/pearlora-logo.svg"
                alt="Pearlora"
                width={26}
                height={26}
                className="rounded object-contain shrink-0"
                unoptimized
              />
              <span className="font-[family-name:var(--font-playfair-display)] text-white text-3xl font-semibold">
                Pearlora
              </span>
            </div>
            <p className="text-[#D8B45A] text-xs font-semibold tracking-[0.18em] uppercase mb-3">
              From Coastlines to Hilltops
            </p>
            <p className="text-white/60 text-sm max-w-sm leading-relaxed">
              Curating extraordinary stays for the discerning traveller across
              Sri Lanka — from colonial coastal forts to misty highland retreats.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/signup"
              className="bg-[#D8B45A] text-[#0f1f3d] font-bold px-8 py-3 rounded-full hover:bg-[#c9a84c] transition-colors text-sm tracking-wide text-center"
            >
              Start Your Journey
            </Link>
            <Link
              href="/results?destination="
              className="border border-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors text-sm tracking-wide text-center"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
