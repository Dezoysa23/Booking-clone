"use client";

import { useState } from "react";

type Props = {
  gallery: string[];
  propertyName: string;
};

export default function PropertyGallery({ gallery, propertyName }: Props) {
  const [activeImage, setActiveImage] = useState(gallery[0]);

  return (
    <div className="mt-8">
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={propertyName}
          className="h-full w-full object-cover transition-all duration-300"
        />
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
          {gallery.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveImage(src)}
              className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-150 ${
                src === activeImage
                  ? "border-[#c9a84c] shadow-sm opacity-100"
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
    </div>
  );
}
