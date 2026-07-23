import Image from "next/image";
import Link from "next/link";
import type { Property } from "@prisma/client";
import SearchBox from "@/components/SearchBox";
import PropertyCard from "@/components/PropertyCard";
import DestinationCard from "@/components/DestinationCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import HeroSlider from "@/components/HeroSlider";
import LuxuryBotanicalSideArt from "@/components/ui/LuxuryBotanicalSideArt";
import { prisma } from "@/lib/prisma";

const DESTINATIONS = [
  {
    title: "Galle",
    subtitle: "Colonial coast & golden sands",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Galle",
  },
  {
    title: "Ella",
    subtitle: "Misty peaks & tea estates",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Ella",
  },
  {
    title: "Mirissa",
    subtitle: "Palm beaches & blue horizons",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Mirissa",
  },
  {
    title: "Kandy",
    subtitle: "Culture, temples & cool air",
    image: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800&auto=format&fit=crop",
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
    <div className="bg-[#F8F2E9]">

      {/* ─── Hero Slider ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto pt-6 md:pt-8">
        <HeroSlider />

        {/* Search box — overlaps hero bottom edge */}
        <div className="mx-auto max-w-4xl -mt-8 md:-mt-10 relative z-10">
          <SearchBox />
        </div>
      </section>

      {/* ─── Trust Pillars ─── */}
      <section className="relative overflow-hidden px-4 md:px-16 max-w-[1280px] mx-auto mt-16 md:mt-20 mb-24">
        <LuxuryBotanicalSideArt side="both" />
        <ScrollReveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "verified",
                color: "from-[#14213D]/12 to-[#14213D]/5",
                iconColor: "text-[#14213D]",
                title: "Curated by Experts",
                body: "Every property is personally vetted for quality, comfort, and genuine Sri Lankan character.",
              },
              {
                icon: "lock",
                color: "from-[#D9A94D]/18 to-[#D9A94D]/5",
                iconColor: "text-[#B8860B]",
                title: "Secure & Simple",
                body: "Book with complete confidence. Your data, payments, and reservations are always protected.",
              },
              {
                icon: "map",
                color: "from-emerald-100 to-emerald-50",
                iconColor: "text-emerald-600",
                title: "Island Specialists",
                body: "Deep local knowledge — from the Galle Fort walls to the Sigiriya sunrise, we know every hidden gem.",
              },
            ].map(({ icon, color, iconColor, title, body }) => (
              <div
                key={title}
                className="hover-lift rounded-2xl bg-white border border-gray-100 shadow-sm px-7 py-7 flex items-start gap-4"
              >
                <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                  <span className={`material-symbols-outlined ${iconColor} text-xl`}>{icon}</span>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* ─── Popular Destinations ─── */}
      <section className="relative overflow-hidden px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <LuxuryBotanicalSideArt side="both" />
        <ScrollReveal>
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-[#D9A94D]" />
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D9A94D]">
                  Explore Sri Lanka
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#14213D]">
                Popular Destinations
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
                Handpicked locations — each with its own light, landscape, and story.
              </p>
            </div>
            <Link
              href="/results?destination="
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors tracking-wide"
            >
              Browse all
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {DESTINATIONS.map((dest) => (
              <DestinationCard key={dest.title} {...dest} />
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/results?destination="
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors"
          >
            Browse all destinations
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ─── Featured Stays ─── */}
      <section className="relative overflow-hidden px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <LuxuryBotanicalSideArt side="both" />
        <ScrollReveal>
          <div className="flex justify-between items-end mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-[#D9A94D]" />
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D9A94D]">
                  Handpicked for You
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#14213D]">
                Featured Stays
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
                Exceptional properties selected for their setting, warmth, and character.
              </p>
            </div>
            <Link
              href="/results?destination="
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors tracking-wide"
            >
              View all
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </ScrollReveal>

        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property, i) => (
              <ScrollReveal key={property.id} delay={i * 0.08}>
                <PropertyCard
                  id={property.id}
                  name={property.name}
                  location={property.location}
                  rating={property.rating}
                  price={property.price}
                  image={property.image}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F2E9] border border-gray-100">
                <span className="material-symbols-outlined text-[#14213D]/30 text-2xl">villa</span>
              </div>
              <p className="text-gray-400 text-sm">Properties coming soon. Check back shortly.</p>
            </div>
          </ScrollReveal>
        )}

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/results?destination="
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors"
          >
            View all properties
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative overflow-hidden px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <LuxuryBotanicalSideArt side="left" />
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-8 bg-[#D9A94D]" />
                <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D9A94D]">
                  Simple &amp; Transparent
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#14213D]">
                How Pearlora Works
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md leading-relaxed">
                Whether you&apos;re booking a stay or listing a property, getting started takes only minutes.
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors tracking-wide"
            >
              Full guide
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2">
          <ScrollReveal direction="left" delay={0.05}>
            <div className="hover-lift rounded-2xl bg-white border border-gray-100 shadow-sm p-8 flex flex-col gap-5 h-full">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14213D]/8">
                  <span className="material-symbols-outlined text-[#14213D] text-xl">travel_explore</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#D9A94D]">For Travellers</p>
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#14213D]">
                    Find &amp; book your perfect stay
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "search",        label: "Search your destination" },
                  { icon: "tune",          label: "Filter by price, guests & rating" },
                  { icon: "calendar_month",label: "Choose available dates" },
                  { icon: "check_circle",  label: "Book instantly & receive confirmation" },
                ].map((item) => (
                  <div key={item.icon} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#14213D] text-lg">{item.icon}</span>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/results?destination="
                className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#14213D] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors"
              >
                Start Searching
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.05}>
            <div
              className="rounded-2xl border border-[#D9A94D]/20 shadow-sm p-8 flex flex-col gap-5 h-full"
              style={{ background: "linear-gradient(135deg, #14213D 0%, #16233F 100%)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D9A94D]/15">
                  <span className="material-symbols-outlined text-[#D9A94D] text-xl">home_work</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#D9A94D]">For Hosts</p>
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-white">
                    List &amp; manage your properties
                  </h3>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "person_add",       label: "Create your host account" },
                  { icon: "workspace_premium",label: "Choose a subscription plan" },
                  { icon: "add_home",         label: "Upload photos & set your price" },
                  { icon: "bar_chart",        label: "Track bookings & performance" },
                ].map((item) => (
                  <div key={item.icon} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#D9A94D] text-lg">{item.icon}</span>
                    <span className="text-sm text-white/75">{item.label}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/become-a-host"
                className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-[#D9A94D] px-6 py-2.5 text-sm font-semibold text-[#14213D] hover:bg-[#c99a3f] transition-colors"
              >
                Become a Host
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:text-[#D9A94D] transition-colors"
          >
            Read the full guide
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ─── Brand CTA ─── */}
      <section className="px-4 md:px-16 max-w-[1280px] mx-auto mb-24">
        <ScrollReveal>
          <div className="relative rounded-3xl overflow-hidden px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-10"
            style={{ background: "linear-gradient(135deg, #101A30 0%, #14213D 50%, #16233F 100%)" }}>

            {/* Decorative concentric rings */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-[#D9A94D]/8" />
            <div className="pointer-events-none absolute -right-14 -top-14 h-64 w-64 rounded-full border border-[#D9A94D]/8" />
            <div className="pointer-events-none absolute -right-4 -top-4 h-40 w-40 rounded-full border border-[#D9A94D]/10" />
            {/* Left glow */}
            <div className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-[#2A3A5C]/12 blur-3xl" />

            <div className="relative z-10 text-center md:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                <Image
                  src="/brand/pearlora-logo.jpg"
                  alt="Pearlora"
                  width={30}
                  height={30}
                  className="rounded object-contain shrink-0"
                  unoptimized
                />
                <span className="font-[family-name:var(--font-playfair-display)] text-white text-3xl font-semibold">
                  Pearlora
                </span>
              </div>
              <p className="text-[#D9A94D] text-[10px] font-bold tracking-[0.22em] uppercase mb-3">
                From Coastlines to Hilltops
              </p>
              <p className="text-white/55 text-sm max-w-sm leading-relaxed">
                Curating extraordinary stays for the discerning traveller across Sri Lanka —
                from colonial coastal forts to misty highland retreats.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/signup"
                className="bg-[#D9A94D] text-[#14213D] font-bold px-8 py-3.5 rounded-full hover:bg-[#E8C892] transition-colors text-sm tracking-wide text-center shadow-[0_4px_20px_rgba(216,180,90,0.3)]"
              >
                Start Your Journey
              </Link>
              <Link
                href="/results?destination="
                className="border border-white/20 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-white/8 transition-colors text-sm tracking-wide text-center"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
