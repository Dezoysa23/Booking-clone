import Image from "next/image";
import Link from "next/link";
import type { Property } from "@prisma/client";
import SearchBox from "@/components/SearchBox";
import PropertyCard from "@/components/PropertyCard";
import DestinationCard from "@/components/DestinationCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/TiltCard";
import { ParallaxBlobs } from "@/components/ParallaxBlobs";
import { OrbBadge, buttonVariants } from "@/components/ui";
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
    title: "Sigiriya",
    subtitle: "Ancient rock & jungle canopy",
    image: "",
    href: "/results?destination=Sigiriya",
  },
  {
    title: "Mirissa",
    subtitle: "Palm beaches & blue horizons",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Mirissa",
  },
  {
    title: "Colombo",
    subtitle: "Harbour city & modern luxury",
    image: "",
    href: "/results?destination=Colombo",
  },
  {
    title: "Kandy",
    subtitle: "Culture, temples & cool air",
    image:
      "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=800&auto=format&fit=crop",
    href: "/results?destination=Kandy",
  },
];

const OFFERS = [
  {
    eyebrow: "Stay Longer",
    title: "Coastal Escapes",
    body: "Sink into the southern shoreline with our longer-stay coastal collection.",
    href: "/results?destination=Mirissa",
    icon: "beach_access",
  },
  {
    eyebrow: "Highland Air",
    title: "Tea-Country Retreats",
    body: "Wake to mist over the hills in Ella's handpicked mountain hideaways.",
    href: "/results?destination=Ella",
    icon: "landscape",
  },
  {
    eyebrow: "City & Culture",
    title: "Heritage Stays",
    body: "Colonial forts and cultural capitals — history with a concierge.",
    href: "/results?destination=Galle",
    icon: "temple_buddhist",
  },
];

const AMENITIES = [
  {
    glyph: "C",
    title: "Private Concierge",
    body: "A dedicated host on call to shape every detail of your stay.",
  },
  {
    glyph: "D",
    title: "Fine Dining",
    body: "Chef-led menus drawing on the island's spices and coastline.",
  },
  {
    glyph: "S",
    title: "Spa & Wellness",
    body: "Ayurvedic treatments and quiet pools for a slower rhythm.",
  },
  {
    glyph: "T",
    title: "Seamless Transfers",
    body: "Door-to-door airport and inter-property travel, arranged for you.",
  },
];

const REVIEWS = [
  {
    quote:
      "Every touch felt considered — from the welcome tea to the sunset the staff timed our dinner around.",
    name: "Amara De Silva",
    trip: "Tidewater Villa, Mirissa",
  },
  {
    quote:
      "We booked in minutes and arrived to exactly what was promised. The highland view alone was worth it.",
    name: "James Fernando",
    trip: "Cinnamon Hill Suite, Ella",
  },
  {
    quote:
      "Pearlora's concierge found us a table no guidebook could. This is how travel should feel.",
    name: "Priya Nair",
    trip: "The Fort Residence, Galle",
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
    <div className="page-gradient">
      {/* ─── Hero — full-bleed, near-full-viewport ─── */}
      <section className="relative">
        <div className="relative h-[100svh] min-h-150 w-full overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2400&auto=format&fit=crop"
            alt="Pearlora — luxury stays across Sri Lanka"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-[#14213d]/70 via-[#14213d]/25 to-[#101a30]/85 px-6 pb-28 text-center md:pb-32">
            <div className="mb-6 flex items-center gap-4">
              <span className="hidden h-px w-14 bg-[#e8c892]/60 sm:block" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#e8c892]">
                Sri Lanka&apos;s Premier Stays
              </span>
              <span className="hidden h-px w-14 bg-[#e8c892]/60 sm:block" />
            </div>

            <h1
              className="mb-5 max-w-4xl font-(family-name:--font-playfair-display) font-semibold leading-[1.04] text-white [text-shadow:0_2px_30px_rgba(9,15,30,0.35)]"
              style={{ fontSize: "clamp(2.5rem, 6.2vw, 5.25rem)" }}
            >
              From Coastlines to Hilltops,
              <br className="hidden sm:block" /> Your Sri Lanka Awaits
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Pearlora curates extraordinary stays for the discerning traveller —
              handpicked, vetted, and ready to book.
            </p>
          </div>

          {/* soft fade into the page at the very bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[#f8f2e9] to-transparent" />
        </div>

        {/* Floating search card straddling the hero's bottom edge */}
        <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 md:-mt-20">
          <SearchBox />
        </div>
      </section>

      {/* ─── Popular Destinations ─── */}
      <section className="mx-auto mb-24 mt-20 max-w-7xl px-4 md:px-16">
        <SectionHead
          eyebrow="Explore the Island"
          title="Popular Destinations"
          copy="Six corners of Sri Lanka, each a different mood — pick where your story begins."
          link={{ href: "/results?destination=", label: "Browse all" }}
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {DESTINATIONS.map((dest) => (
            <DestinationCard key={dest.title} {...dest} />
          ))}
        </div>
      </section>

      {/* ─── Special Offers ─── */}
      <section className="mx-auto mb-24 max-w-7xl px-4 md:px-16">
        <SectionHead
          eyebrow="Limited Collections"
          title="Special Offers"
          copy="Curated themes to match the trip you're dreaming of."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {OFFERS.map((offer) => (
            <Link
              key={offer.title}
              href={offer.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white p-7 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f4ecd8] transition-transform duration-500 group-hover:scale-125" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#14213d] text-[#e8c892]">
                <span className="material-symbols-outlined" aria-hidden="true">
                  {offer.icon}
                </span>
              </span>
              <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a9791f]">
                {offer.eyebrow}
              </p>
              <h3 className="relative mt-1 font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
                {offer.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-on-surface-variant">
                {offer.body}
              </p>
              <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#14213d]">
                View stays
                <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                  arrow_forward
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Featured Rooms & Rates ─── */}
      <section className="mx-auto mb-24 max-w-7xl px-4 md:px-16">
        <SectionHead
          eyebrow="Handpicked for You"
          title="Featured Rooms & Rates"
          copy="Exceptional properties selected for comfort, location, and character."
          link={{ href: "/results?destination=", label: "View all" }}
        />
        {featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="rounded-2xl border border-[#e7ddc9] bg-white p-16 text-center shadow-card">
            <p className="text-sm text-[#7c879b]">
              Properties coming soon. Check back shortly.
            </p>
          </div>
        )}
      </section>

      {/* ─── Amenities & Services (signature dark glass section) ─── */}
      <section className="relative mb-24 overflow-hidden">
        <div className="section-navy relative mx-auto max-w-350 overflow-hidden rounded-none px-4 py-20 md:px-16 md:py-28">
          <ParallaxBlobs />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-12 max-w-xl">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#d9a94d]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8c892]">
                  The Pearlora Difference
                </span>
              </div>
              <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-white md:text-5xl">
                Amenities &amp; Services
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                The quiet luxuries that turn a room into a stay — arranged before
                you arrive.
              </p>
            </div>

            <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {AMENITIES.map((a) => (
                <TiltCard key={a.title}>
                  <div className="glass-panel-dark flex h-full flex-col rounded-2xl p-7">
                    <OrbBadge glyph={a.glyph} size={56} />
                    <h3 className="mt-5 font-(family-name:--font-playfair-display) text-xl font-semibold text-white">
                      {a.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {a.body}
                    </p>
                  </div>
                </TiltCard>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Guest Reviews ─── */}
      <section className="mx-auto mb-24 max-w-7xl px-4 md:px-16">
        <SectionHead
          eyebrow="In Their Words"
          title="Guest Reviews"
          copy="What discerning travellers say after they check out."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <figure
              key={r.name}
              className="flex flex-col rounded-2xl border border-[#e7ddc9] bg-white p-7 shadow-card"
            >
              <div className="flex gap-0.5 text-[#d9a94d]" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined filled text-lg">
                    star
                  </span>
                ))}
              </div>
              <blockquote className="mt-4 flex-1 font-(family-name:--font-playfair-display) text-lg italic leading-relaxed text-[#16233f]">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-[#f1e7d6] pt-4">
                <OrbBadge glyph={r.name.charAt(0)} size={40} />
                <div>
                  <p className="text-sm font-semibold text-[#14213d]">{r.name}</p>
                  <p className="text-xs text-[#7c879b]">{r.trip}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="mx-auto mb-24 max-w-7xl px-4 md:px-16">
        <div className="section-navy relative overflow-hidden rounded-3xl px-6 py-14 text-center md:px-16">
          <div className="relative mx-auto max-w-2xl">
            <span className="text-[#e8c892]">
              <span className="material-symbols-outlined text-3xl" aria-hidden="true">
                mail
              </span>
            </span>
            <h2 className="mt-3 font-(family-name:--font-playfair-display) text-3xl font-semibold text-white md:text-4xl">
              Stays worth the journey, in your inbox
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/70">
              Occasional letters on new properties and quiet-season offers. No
              noise.
            </p>
            <div className="mt-7">
              <NewsletterSignup />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  copy,
  link,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  link?: { href: string; label: string };
}) {
  return (
    <Reveal className="mb-8 flex items-end justify-between gap-6">
      <div>
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-[#d9a94d]" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a9791f]">
            {eyebrow}
          </span>
        </div>
        <h2 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d] md:text-4xl">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">{copy}</p>
      </div>
      {link ? (
        <Link
          href={link.href}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "hidden gap-1 md:inline-flex",
          })}
        >
          {link.label}
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      ) : null}
    </Reveal>
  );
}
