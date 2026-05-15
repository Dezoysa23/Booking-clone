import Link from "next/link";
import { Suspense } from "react";
import type { Property } from "@prisma/client";
import PropertyCard from "@/components/PropertyCard";
import ResultsFilterForm from "@/components/ResultsFilterForm";
import { prisma } from "@/lib/prisma";

type ResultsPageProps = {
  searchParams: Promise<{
    destination?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
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
  const sortBy = params.sortBy || "";

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
      },
      orderBy,
    });
  } catch (error) {
    console.error("[Results] Failed to fetch properties:", error);
    dbError = true;
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              Search Results
            </h1>
            {destination && (
              <p className="mt-1 text-sm text-gray-500">
                Showing properties in{" "}
                <span className="font-semibold text-gray-700">{destination}</span>
              </p>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <Suspense fallback={<div className="mt-6 h-32 rounded-2xl bg-white border border-gray-100 animate-pulse" />}>
          <ResultsFilterForm />
        </Suspense>

        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d]">
              Available Properties
            </h2>
            {!dbError && (
              <p className="text-sm text-gray-500">
                {resultsToShow.length}{" "}
                {resultsToShow.length === 1 ? "property" : "properties"} found
              </p>
            )}
          </div>

          {dbError ? (
            <div className="rounded-2xl bg-white border border-red-100 shadow-sm p-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
                <span className="material-symbols-outlined text-red-400 text-xl">error_outline</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
                Unable to load properties
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                There was a problem connecting to our servers. Please try again shortly.
              </p>
            </div>
          ) : resultsToShow.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resultsToShow.map((property) => (
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
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-gray-100">
                <span className="material-symbols-outlined text-[#0f1f3d]/30 text-xl">search_off</span>
              </div>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
                No properties found
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Try adjusting your filters or search for a different destination.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
