"use client";

import { useState } from "react";
import PropertyLightbox from "@/components/PropertyLightbox";

type Props = {
  gallery: string[];
  propertyName: string;
};

export default function PropertyGallery({ gallery, propertyName }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const open = (index: number) => {
    setStartIndex(index);
    setLightboxOpen(true);
  };

  const hero = gallery[0];
  const smalls = gallery.slice(1, 5); // up to 4 small tiles
  const remaining = gallery.length - 5; // extra beyond the 5 shown

  return (
    <div className="mt-8">
      {/* 5-tile grid: 1 large + up to 4 small */}
      <div className="grid grid-cols-2 gap-2.5 overflow-hidden rounded-3xl md:h-[460px] md:grid-cols-4 md:grid-rows-2">
        {/* Large hero tile */}
        <button
          type="button"
          onClick={() => open(0)}
          aria-label="Open full-screen gallery"
          className="group relative col-span-2 row-span-2 h-56 cursor-zoom-in overflow-hidden md:h-auto"
        >
          <span className="section-navy absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[#e8c892]/60" aria-hidden="true">
              photo_camera
            </span>
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero}
            alt={propertyName}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-[#14213d]/0 transition-colors group-hover:bg-[#14213d]/10" />
        </button>

        {/* Small tiles */}
        {smalls.map((src, i) => {
          const index = i + 1;
          const isLastShown = i === smalls.length - 1;
          const showMore = isLastShown && remaining > 0;
          return (
            <button
              key={index}
              type="button"
              onClick={() => open(index)}
              aria-label={
                showMore
                  ? `View all ${gallery.length} photos`
                  : `Open photo ${index + 1}`
              }
              className="group relative hidden h-full cursor-zoom-in overflow-hidden md:block"
            >
              <span className="section-navy absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-[#e8c892]/60" aria-hidden="true">
                  photo_camera
                </span>
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${propertyName} view ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              {showMore ? (
                <span className="absolute inset-0 flex items-center justify-center bg-[#14213d]/65 text-sm font-semibold text-white backdrop-blur-[1px]">
                  +{remaining} Photos
                </span>
              ) : (
                <span className="absolute inset-0 bg-[#14213d]/0 transition-colors group-hover:bg-[#14213d]/10" />
              )}
            </button>
          );
        })}

        {/* Mobile: "view all" affordance under the hero */}
        {gallery.length > 1 ? (
          <button
            type="button"
            onClick={() => open(0)}
            className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-[#e7ddc9] bg-white py-2.5 text-sm font-semibold text-[#14213d] md:hidden"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              photo_library
            </span>
            View all {gallery.length} photos
          </button>
        ) : null}
      </div>

      {lightboxOpen && (
        <PropertyLightbox
          images={gallery}
          initialIndex={startIndex}
          propertyName={propertyName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
