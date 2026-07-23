"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { FACILITY_OPTIONS, FACILITY_GROUPS } from "@/lib/property-constants";

export default function ResultsFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);

  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [guests, setGuests] = useState(searchParams.get("guests") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [facilities, setFacilities] = useState<string[]>(() => {
    const raw = searchParams.get("facilities");
    return raw ? raw.split(",").filter(Boolean) : [];
  });

  const toggleFacility = (key: string) => {
    setFacilities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleApplyFilters = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (guests) params.set("guests", guests);
    if (sortBy) params.set("sortBy", sortBy);
    if (facilities.length > 0) params.set("facilities", facilities.join(","));

    const newUrl = `/results?${params.toString()}`;
    const currentUrl = `/results?${searchParams.toString()}`;
    if (newUrl === currentUrl) return;

    startTransition(() => { router.push(newUrl); });
  };

  const clearAll = () => {
    setDestination("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setGuests("");
    setSortBy("");
    setFacilities([]);
    startTransition(() => { router.push("/results"); });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#14213D] focus:bg-white focus:ring-2 focus:ring-[#14213D]/10";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#7C879B]";

  const hasFilters = destination || minPrice || maxPrice || minRating || guests || sortBy || facilities.length > 0;

  return (
    <form onSubmit={handleApplyFilters} className="mt-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#14213D]">
            Filter & Sort
          </h2>
          {hasFilters && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#14213D]/8 px-2.5 py-0.5 text-xs font-semibold text-[#14213D]">
              <span className="material-symbols-outlined text-xs">filter_list</span>
              Filters active
            </span>
          )}
        </div>

        {/* Main filters row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className={labelClass}>Destination</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Colombo" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Min Price</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 10000" min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Max Price</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 50000" min="0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Guests</label>
            <input type="number" value={guests} onChange={(e) => setGuests(e.target.value)} placeholder="e.g. 4" min="1" max="50" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Min Rating</label>
            <input type="number" step="0.1" value={minRating} onChange={(e) => setMinRating(e.target.value)} placeholder="e.g. 8.0" min="1" max="10" className={inputClass} />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputClass} max-w-xs`}>
            <option value="">Default (Best Rated)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: Best First</option>
            <option value="rating_asc">Rating: Lowest First</option>
          </select>
        </div>
      </div>

      {/* Facility filters — collapsible */}
      <div className="border-t border-gray-100">
        <button
          type="button"
          onClick={() => setFacilitiesOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#14213D] text-base">checklist</span>
            <span className="text-sm font-semibold text-[#14213D]">Facilities</span>
            {facilities.length > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#14213D] text-white text-xs font-bold">
                {facilities.length}
              </span>
            )}
          </div>
          <span
            className="material-symbols-outlined text-[#7C879B] text-base transition-transform"
            style={{ transform: facilitiesOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            expand_more
          </span>
        </button>

        {facilitiesOpen && (
          <div className="px-6 pb-5 bg-white">
            <p className="text-xs text-[#7C879B] mb-4">Select facilities to find properties that offer them.</p>
            <div className="space-y-4">
              {FACILITY_GROUPS.map((group) => {
                const groupItems = FACILITY_OPTIONS.filter((f) => f.group === group);
                return (
                  <div key={group}>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#7C879B] mb-2">{group}</p>
                    <div className="flex flex-wrap gap-2">
                      {groupItems.map((f) => {
                        const active = facilities.includes(f.key);
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => toggleFacility(f.key)}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              active
                                ? "border-[#14213D] bg-[#14213D] text-white"
                                : "border-gray-200 bg-white text-[#3B4658] hover:border-[#14213D]/40 hover:text-[#14213D]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">{f.icon}</span>
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-[#14213D] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors disabled:opacity-60"
        >
          {isPending ? "Applying…" : "Apply Filters"}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-[#3B4658] hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>
    </form>
  );
}
