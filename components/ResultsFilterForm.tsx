"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ResultsFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (destination) params.set("destination", destination);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (sortBy) params.set("sortBy", sortBy);

    router.push(`/results?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleApplyFilters}
      className="mt-6 rounded-2xl bg-white p-6 shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-900">Filter Results</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Colombo"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Min Price
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Max Price
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 30000"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Min Rating
          </label>
          <input
            type="number"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none"
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
      >
        Apply Filters
      </button>
    </form>
  );
}