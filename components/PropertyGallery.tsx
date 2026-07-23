"use client";

import { useState } from "react";
import PropertyLightbox from "@/components/PropertyLightbox";

type Props = {
  gallery: string[];
  propertyName: string;
};

export default function PropertyGallery({ gallery, propertyName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = gallery[activeIndex] ?? gallery[0];

  return (
    <div className="mt-8">
      {/* Main image — click to open lightbox */}
      <div
        className="relative h-[420px] w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100 cursor-zoom-in group"
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Open full-screen gallery"
        onKeyDown={(e) => e.key === "Enter" && setLightboxOpen(true)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={propertyName}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.02]"
        />

        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-3">
            <span className="material-symbols-outlined text-white text-2xl">zoom_in</span>
          </div>
        </div>

        {/* Image count badge */}
        {gallery.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">
            <span className="material-symbols-outlined text-sm">photo_library</span>
            {gallery.length} photos
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
                index === activeIndex
                  ? "border-[#D9A94D] shadow-sm opacity-100"
                  : "border-transparent opacity-60 hover:opacity-90 hover:border-gray-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${propertyName} view ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox portal */}
      {lightboxOpen && (
        <PropertyLightbox
          images={gallery}
          initialIndex={activeIndex}
          propertyName={propertyName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
