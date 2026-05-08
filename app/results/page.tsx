import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import ResultsFilterForm from "@/components/ResultsFilterForm";
import { prisma } from "@/lib/prisma";

type ResultsPageProps = {
  searchParams: Promise<{
    destination?: string;
    dates?: string;
    guests?: string;
    minPrice?: string;
    maxPrice?: string;
    minRating?: string;
    sortBy?: string;
  }>;
};

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const params = await searchParams;

  const destination = params.destination || "";
  const dates = params.dates || "No dates selected";
  const guests = params.guests || "No guest info";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const minRating = params.minRating ? Number(params.minRating) : undefined;
  const sortBy = params.sortBy || "";

  let orderBy:
    | { price: "asc" | "desc" }
    | { rating: "asc" | "desc" }
    | Array<{ rating: "desc" } | { price: "asc" }> = [
      { rating: "desc" },
      { price: "asc" },
    ];

  if (sortBy === "price_asc") {
    orderBy = { price: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { price: "desc" };
  } else if (sortBy === "rating_desc") {
    orderBy = { rating: "desc" };
  } else if (sortBy === "rating_asc") {
    orderBy = { rating: "asc" };
  }

  const resultsToShow = await prisma.property.findMany({
    where: {
      ...(destination
        ? {
            location: {
              contains: destination,
              mode: "insensitive",
            },
          }
        : {}),
      ...(minPrice !== undefined
        ? {
            price: {
              gte: minPrice,
            },
          }
        : {}),
      ...(maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              lte: maxPrice,
            },
          }
        : {}),
      ...(minRating !== undefined
        ? {
            rating: {
              gte: minRating,
            },
          }
        : {}),
    },
    orderBy,
  });

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900">Search Results</h1>

        <div className="mt-4">
          <Link
            href="/"
            className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Destination:</span>{" "}
            {destination || "Any destination"}
          </p>

          <p className="mt-3 text-lg text-gray-700">
            <span className="font-semibold">Dates:</span> {dates}
          </p>

          <p className="mt-3 text-lg text-gray-700">
            <span className="font-semibold">Guests:</span> {guests}
          </p>
        </div>

        <ResultsFilterForm />

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h2>

          <p className="mt-2 text-gray-600">
            {resultsToShow.length} properties found
          </p>

          {resultsToShow.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-6 rounded-xl bg-white p-6 text-gray-500 shadow-md">
              No properties found for these filters.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}