"use client";

import { useState } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { FACILITY_OPTIONS } from "@/lib/property-constants";

const FACILITY_LABEL = new Map(FACILITY_OPTIONS.map((f) => [f.key, f]));

type Props = {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  reviews?: number;
  facilities?: string[];
  checkIn?: string;
  checkOut?: string;
};

export default function ResultCard({
  id,
  name,
  location,
  rating,
  price,
  image,
  reviews,
  facilities = [],
  checkIn,
  checkOut,
}: Props) {
  const [favorite, setFavorite] = useState(false);

  const q = new URLSearchParams();
  if (checkIn) q.set("checkIn", checkIn);
  if (checkOut) q.set("checkOut", checkOut);
  const query = q.toString();
  const href = `/properties/${id}${query ? `?${query}` : ""}`;

  const tags = facilities
    .map((key) => FACILITY_LABEL.get(key))
    .filter((f): f is NonNullable<typeof f> => Boolean(f))
    .slice(0, 3);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:flex-row">
      {/* Image */}
      <div className="relative h-52 shrink-0 overflow-hidden sm:h-auto sm:w-72">
        <SafeImage
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, 288px"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {rating >= 9 ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#d9a94d] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#14213d]">
            Top rated
          </span>
        ) : null}
        <button
          type="button"
          aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={favorite}
          onClick={() => setFavorite((v) => !v)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#14213d] shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
        >
          <span
            className={`material-symbols-outlined text-lg ${favorite ? "filled text-[#c0392b]" : "text-[#14213d]"}`}
            aria-hidden="true"
          >
            favorite
          </span>
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-(family-name:--font-playfair-display) text-xl font-semibold leading-snug text-[#14213d]">
              {name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-[#d9a94d]" aria-hidden="true">
                location_on
              </span>
              {location}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#14213d] px-2.5 py-1">
            <span className="material-symbols-outlined filled text-sm text-[#e8c892]" aria-hidden="true">
              star
            </span>
            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
          </div>
        </div>

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t.key}
                className="inline-flex items-center gap-1 rounded-full bg-[#f4ecd8] px-2.5 py-1 text-[11px] font-medium text-on-primary-fixed-variant"
              >
                <span className="material-symbols-outlined text-xs" aria-hidden="true">
                  {t.icon}
                </span>
                {t.label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {typeof reviews === "number" ? (
              <p className="text-xs text-[#7c879b]">
                {reviews.toLocaleString()} {reviews === 1 ? "review" : "reviews"}
              </p>
            ) : null}
            <p className="text-lg font-bold leading-tight text-[#14213d]">
              LKR {price.toLocaleString()}
              <span className="text-xs font-normal text-[#7c879b]"> /night</span>
            </p>
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-[#d9a94d] px-5 py-2.5 text-sm font-semibold text-[#14213d] transition-colors hover:bg-[#c4922f]"
          >
            View Details
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
