import Link from "next/link";
import { Suspense } from "react";
import type { Property } from "@prisma/client";
import ResultCard from "@/components/ResultCard";
import ResultsFilterForm from "@/components/ResultsFilterForm";
import ResultsSortControl from "@/components/ResultsSortControl";
import { Reveal } from "@/components/Reveal";
import { EmptyState, Skeleton } from "@/components/ui";
import { prisma } from "@/lib/prisma";

type ResultsPageProps = {
  searchParams: Promise<{
    destination?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    guests?: string;
    rooms?: string;
    sortBy?: string;
    facilities?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
};

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;

  const destination = params.destination?.trim() || "";

  function safeNum(value: string | undefined): number | undefined {
    if (!value || value.trim() === "") return undefined;
    const n = Number(value);
    return isNaN(n) ? undefined : n;
  }

  const minPrice = safeNum(params.minPrice);
  const maxPrice = safeNum(params.maxPrice);
  const minRating = safeNum(params.minRating);
  const guests = safeNum(params.guests);
  const rooms = safeNum(params.rooms);
  const sortBy = params.sortBy || "";
  const facilitiesParam = params.facilities?.trim() || "";
  const facilities = facilitiesParam
    ? facilitiesParam.split(",").filter(Boolean)
    : [];

  // Stay dates flow through from the home search / carried across filters and
  // are forwarded to each property so the booking form can prefill them.
  const checkIn = params.checkIn?.trim() || "";
  const checkOut = params.checkOut?.trim() || "";

  let orderBy:
    | { price: "asc" | "desc" }
    | { rating: "asc" | "desc" }
    | Array<{ rating: "desc" } | { price: "asc" }> = [
    { rating: "desc" },
    { price: "asc" },
  ];

  if (sortBy === "price_asc") orderBy = { price: "asc" };
  else if (sortBy === "price_desc") orderBy = { price: "desc" };
  else if (sortBy === "rating_desc") orderBy = { rating: "desc" };
  else if (sortBy === "rating_asc") orderBy = { rating: "asc" };

  let resultsToShow: Property[] = [];
  let dbError = false;
  try {
    resultsToShow = await prisma.property.findMany({
      where: {
        ...(destination
          ? { location: { contains: destination, mode: "insensitive" } }
          : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
              },
            }
          : {}),
        ...(minRating !== undefined ? { rating: { gte: minRating } } : {}),
        ...(guests !== undefined
          ? {
              OR: [{ maxGuests: null }, { maxGuests: { gte: guests } }],
            }
          : {}),
        ...(facilities.length > 0
          ? { facilities: { hasSome: facilities } }
          : {}),
      },
      orderBy,
    });
  } catch (error) {
    console.error("[Results] Failed to fetch properties:", error);
    dbError = true;
  }

  const summaryBits = [
    destination || "All destinations",
    checkIn && checkOut ? `${checkIn} → ${checkOut}` : "Any dates",
    guests ? `${guests}+ guests` : "Any guests",
    rooms ? `${rooms} ${rooms === 1 ? "room" : "rooms"}` : null,
  ].filter(Boolean);

  return (
    <main className="page-gradient min-h-screen">
      {/* ─── Sticky search summary bar ─── */}
      <div className="sticky top-16 z-20 border-b border-[#e7ddc9] bg-[#f8f2e9]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 md:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-[#d9a94d]" aria-hidden="true">
              travel_explore
            </span>
            {summaryBits.map((bit, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 ? (
                  <span className="text-[#c7bba3]" aria-hidden="true">
                    ·
                  </span>
                ) : null}
                <span className="truncate text-sm font-medium text-[#14213d]">
                  {bit}
                </span>
              </span>
            ))}
          </div>
          <a
            href="#filters"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#14213d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#101a30]"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              tune
            </span>
            Update search
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        {/* Heading */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d] md:text-4xl">
              {destination ? `Stays in ${destination}` : "Browse Stays"}
            </h1>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              {dbError
                ? "We hit a problem loading stays."
                : `${resultsToShow.length} ${resultsToShow.length === 1 ? "property" : "properties"} found`}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#14213d]/25 bg-white px-4 py-2 text-sm font-semibold text-[#14213d] transition-colors hover:border-[#14213d]/45 hover:bg-[#14213d]/3"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              arrow_back
            </span>
            Home
          </Link>
        </div>

        {/* Two-column: filters + list */}
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Suspense fallback={<Skeleton className="h-140 w-full rounded-2xl" />}>
              <ResultsFilterForm />
            </Suspense>
          </aside>

          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
                Available Properties
              </h2>
              <Suspense fallback={null}>
                <ResultsSortControl />
              </Suspense>
            </div>

            {dbError ? (
              <EmptyState
                icon="cloud_off"
                title="Unable to load properties"
                description="There was a problem connecting to our servers. Please try again shortly."
                className="border-[#e5c9c2] bg-[#f8e0dc]/40"
              />
            ) : resultsToShow.length > 0 ? (
              <Reveal className="space-y-5">
                {resultsToShow.map((property) => (
                  <ResultCard
                    key={property.id}
                    id={property.id}
                    name={property.name}
                    location={property.location}
                    rating={property.rating}
                    price={property.price}
                    image={property.image}
                    reviews={property.reviews}
                    facilities={property.facilities}
                    checkIn={checkIn || undefined}
                    checkOut={checkOut || undefined}
                  />
                ))}
              </Reveal>
            ) : (
              <EmptyState
                icon="search_off"
                title="No properties found"
                description="Try adjusting your filters or searching for a different destination."
                action={
                  <Link
                    href="/results"
                    className="inline-flex items-center rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f]"
                  >
                    Clear search
                  </Link>
                }
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
