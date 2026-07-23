import { NEARBY_CATEGORIES } from "@/lib/property-constants";
import type { NearbyHighlight } from "@prisma/client";

type Props = {
  highlights: NearbyHighlight[];
};

export default function NearbyHighlightsSection({ highlights }: Props) {
  if (highlights.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-px w-6 bg-[#D9A94D]" />
        <span className="text-xs font-semibold tracking-[0.18em] uppercase text-[#D9A94D]">Local Highlights</span>
      </div>
      <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-6">
        What makes this stay special
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((h) => {
          const cat = NEARBY_CATEGORIES.find((c) => c.value === h.category);
          return (
            <div
              key={h.id}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {h.imageUrl && (
                <div className="relative h-44 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.imageUrl}
                    alt={h.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {cat && (
                    <span
                      className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: `${cat.color}cc` }}
                    >
                      <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                      {cat.label}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!h.imageUrl && cat && (
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${cat.color}15` }}
                      >
                        <span
                          className="material-symbols-outlined text-base"
                          style={{ color: cat.color }}
                        >
                          {cat.icon}
                        </span>
                      </div>
                    )}
                    <h3 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#14213D] text-sm leading-snug">
                      {h.title}
                    </h3>
                  </div>
                  {h.distance != null && (
                    <span className="text-xs font-semibold text-[#14213D] shrink-0 bg-[#14213D]/8 px-2 py-0.5 rounded-full whitespace-nowrap">
                      {h.distance} {h.distanceUnit ?? "km"}
                    </span>
                  )}
                </div>
                {h.locationName && (
                  <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {h.locationName}
                  </p>
                )}
                {h.description && (
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-3">{h.description}</p>
                )}
                {!h.imageUrl && cat && (
                  <span
                    className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ backgroundColor: `${cat.color}12`, color: cat.color }}
                  >
                    <span className="material-symbols-outlined text-xs">{cat.icon}</span>
                    {cat.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
