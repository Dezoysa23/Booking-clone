"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

export default function ResultsFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");

  const handleApplyFilters = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (sortBy) params.set("sortBy", sortBy);

    const newUrl = `/results?${params.toString()}`;
    const currentUrl = `/results?${searchParams.toString()}`;

    if (newUrl === currentUrl) {
      return;
    }

    startTransition(() => {
      router.push(newUrl);
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#0f1f3d] focus:bg-white focus:ring-2 focus:ring-[#0f1f3d]/10";

  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400";

  return (
    <form
      onSubmit={handleApplyFilters}
      className="mt-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-6"
    >
      <h2 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d] mb-5">
        Filter & Sort
      </h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={labelClass}>Destination</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Colombo"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Min Price</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="e.g. 10000"
            min="0"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Max Price</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 50000"
            min="0"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Min Rating</label>
          <input
            type="number"
            step="0.1"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="e.g. 8.0"
            min="1"
            max="10"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputClass}
          >
            <option value="">Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: Best First</option>
            <option value="rating_asc">Rating: Lowest First</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#0f1f3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors disabled:opacity-60"
        >
          {isPending ? "Applying..." : "Apply Filters"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDestination("");
            setMinPrice("");
            setMaxPrice("");
            setMinRating("");
            setSortBy("");
            startTransition(() => {
              router.push("/results");
            });
          }}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
