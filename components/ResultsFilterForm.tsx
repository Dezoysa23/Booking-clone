"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
import { FACILITY_OPTIONS, FACILITY_GROUPS } from "@/lib/property-constants";
import { cn } from "@/lib/cn";

const PRICE_MAX = 100000;
const PRICE_STEP = 5000;

const RATING_PILLS = [
  { label: "Any", value: "" },
  { label: "8+", value: "8" },
  { label: "9+", value: "9" },
  { label: "9.5+", value: "9.5" },
];

export default function ResultsFilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  // Filters collapse on mobile (below lg) so results are reachable immediately.
  const [mobileOpen, setMobileOpen] = useState(false);

  const [destination, setDestination] = useState(
    searchParams.get("destination") || "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("minRating") || "");
  const [guests, setGuests] = useState(
    Number(searchParams.get("guests")) || 0,
  );
  const [facilities, setFacilities] = useState<string[]>(() => {
    const raw = searchParams.get("facilities");
    return raw ? raw.split(",").filter(Boolean) : [];
  });

  // Preserved across filter changes (set elsewhere in the flow).
  const carrySortBy = searchParams.get("sortBy") || "";
  const carryCheckIn = searchParams.get("checkIn") || "";
  const carryCheckOut = searchParams.get("checkOut") || "";
  const carryRooms = searchParams.get("rooms") || "";

  const toggleFacility = (key: string) => {
    setFacilities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleApply = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", minRating);
    if (guests > 0) params.set("guests", String(guests));
    if (facilities.length > 0) params.set("facilities", facilities.join(","));
    if (carrySortBy) params.set("sortBy", carrySortBy);
    if (carryCheckIn) params.set("checkIn", carryCheckIn);
    if (carryCheckOut) params.set("checkOut", carryCheckOut);
    if (carryRooms) params.set("rooms", carryRooms);

    startTransition(() => router.push(`/results?${params.toString()}`));
  };

  const clearAll = () => {
    setDestination("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setGuests(0);
    setFacilities([]);
    startTransition(() => router.push("/results"));
  };

  const hasFilters =
    destination || minPrice || maxPrice || minRating || guests > 0 || facilities.length > 0;

  return (
    <form
      id="filters"
      onSubmit={handleApply}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white shadow-card"
    >
      <div className="flex items-center justify-between border-b border-[#f1e7d6] px-5 py-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          className="flex items-center gap-2 lg:pointer-events-none"
        >
          <span
            className="material-symbols-outlined text-xl leading-none text-[#d9a94d] lg:hidden"
            aria-hidden="true"
          >
            tune
          </span>
          <h2 className="font-(family-name:--font-playfair-display) text-lg font-semibold text-[#14213d]">
            Filters
          </h2>
          <span
            className={cn(
              "material-symbols-outlined text-xl leading-none text-[#7c879b] transition-transform lg:hidden",
              mobileOpen && "rotate-180",
            )}
            aria-hidden="true"
          >
            expand_more
          </span>
        </button>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-[#a9791f] transition-colors hover:text-on-primary-fixed-variant"
          >
            Reset all
          </button>
        ) : null}
      </div>

      <div className={cn(mobileOpen ? "block" : "hidden", "lg:block")}>
      <div className="space-y-6 px-5 py-5">
        {/* Destination */}
        <div>
          <label htmlFor="f-destination" className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#14213d]/60">
            Destination
          </label>
          <input
            id="f-destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Galle"
            className="w-full rounded-xl border border-[#e7ddc9] bg-white px-3.5 py-2.5 text-sm text-[#16233f] outline-none transition-colors placeholder:text-[#7c879b] focus:border-[#d9a94d] focus:ring-2 focus:ring-[#d9a94d]/30"
          />
        </div>

        {/* Price range */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#14213d]/60">
              Max price / night
            </span>
            <span className="text-xs font-semibold text-[#14213d]">
              {maxPrice ? `LKR ${Number(maxPrice).toLocaleString()}` : "Any"}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={maxPrice ? Number(maxPrice) : PRICE_MAX}
            onChange={(e) =>
              setMaxPrice(
                Number(e.target.value) >= PRICE_MAX ? "" : e.target.value,
              )
            }
            className="price-range w-full accent-[#d9a94d]"
            aria-label="Maximum price per night"
          />
          <div className="mt-3">
            <label htmlFor="f-minprice" className="mb-1.5 block text-[11px] font-medium text-[#7c879b]">
              Minimum price
            </label>
            <input
              id="f-minprice"
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-[#e7ddc9] bg-white px-3.5 py-2 text-sm text-[#16233f] outline-none transition-colors placeholder:text-[#7c879b] focus:border-[#d9a94d] focus:ring-2 focus:ring-[#d9a94d]/30"
            />
          </div>
        </div>

        {/* Guests stepper */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#14213d]/60">
            Guests
          </span>
          <div className="flex items-center justify-between rounded-xl border border-[#e7ddc9] px-3 py-2">
            <span className="text-sm text-[#16233f]">
              {guests > 0 ? `${guests}+ guests` : "Any"}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Decrease guests"
                onClick={() => setGuests((g) => Math.max(0, g - 1))}
                disabled={guests <= 0}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e7ddc9] text-[#14213d] transition-colors hover:border-[#d9a94d] hover:bg-[#f4ecd8] disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">remove</span>
              </button>
              <span className="w-5 text-center text-sm font-semibold text-[#14213d]">{guests}</span>
              <button
                type="button"
                aria-label="Increase guests"
                onClick={() => setGuests((g) => Math.min(20, g + 1))}
                disabled={guests >= 20}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#e7ddc9] text-[#14213d] transition-colors hover:border-[#d9a94d] hover:bg-[#f4ecd8] disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rating pills */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#14213d]/60">
            Guest rating
          </span>
          <div className="flex flex-wrap gap-2">
            {RATING_PILLS.map((pill) => {
              const active = minRating === pill.value;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setMinRating(pill.value)}
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "border-[#14213d] bg-[#14213d] text-white"
                      : "border-[#e7ddc9] bg-white text-on-surface-variant hover:border-[#d9a94d] hover:text-[#14213d]",
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities */}
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#14213d]/60">
            Facilities
          </span>
          <div className="space-y-4">
            {FACILITY_GROUPS.map((group) => {
              const groupItems = FACILITY_OPTIONS.filter((f) => f.group === group);
              return (
                <div key={group}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#7c879b]">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {groupItems.map((f) => {
                      const active = facilities.includes(f.key);
                      return (
                        <label
                          key={f.key}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-[#16233f] transition-colors hover:text-[#14213d]"
                        >
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => toggleFacility(f.key)}
                            className="h-4 w-4 rounded border-[#c7bba3] text-[#d9a94d] accent-[#d9a94d] focus:ring-[#d9a94d]/40"
                          />
                          <span className="material-symbols-outlined text-base text-[#d9a94d]" aria-hidden="true">
                            {f.icon}
                          </span>
                          {f.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 border-t border-[#f1e7d6] px-5 py-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f] disabled:opacity-60"
        >
          {isPending ? "Applying…" : "Apply Filters"}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="rounded-full border border-[#14213d]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#14213d] transition-colors hover:border-[#14213d]/45 hover:bg-[#14213d]/3"
        >
          Reset
        </button>
      </div>
      </div>
    </form>
  );
}
