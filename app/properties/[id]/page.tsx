import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import BookingForm from "@/components/BookingForm";
import PropertyGallery from "@/components/PropertyGallery";
import UserPhotoSection from "@/components/UserPhotoSection";
import NearbyHighlightsSection from "@/components/NearbyHighlightsSection";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFacilityByKey } from "@/lib/property-constants";

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>;
};

type HouseRules = {
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
  cancellationPolicy?: string;
  prepaymentPolicy?: string;
  petsPolicy?: string;
  childrenPolicy?: string;
  cribsAvailable?: boolean;
  extraBedsAvailable?: boolean;
  ageRestriction?: string;
  smokingPolicy?: string;
  partiesPolicy?: string;
  quietHours?: string;
};

type AreaItem = { name: string; type?: string; distance?: number | string; distanceUnit?: string };

type AreaInfo = {
  attractions?: AreaItem[];
  restaurants?: AreaItem[];
  transit?: AreaItem[];
  airports?: AreaItem[];
  naturalBeauty?: AreaItem[];
};

function formatTime(t: string) {
  if (!t) return t;
  const [h, m] = t.split(":");
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function formatDistance(item: AreaItem) {
  if (item.distance == null) return "";
  return `${item.distance} ${item.distanceUnit ?? "km"}`;
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const resolvedParams = await params;
  const propertyId = Number(resolvedParams.id);
  if (Number.isNaN(propertyId)) notFound();

  const [property, currentUser] = await Promise.all([
    prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        nearbyHighlights: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
        userPhotos: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!property) notFound();

  const galleryImages = property.gallery.length > 0 ? property.gallery : [property.image];
  const houseRules = property.houseRules as HouseRules | null;
  const areaInfo = property.areaInfo as AreaInfo | null;

  // Build FAQ-style answers from facilities/rules
  const faqs: { q: string; a: string }[] = [];
  if (property.facilities.includes("breakfast"))
    faqs.push({ q: "Do they serve breakfast?", a: "Yes — breakfast is included." });
  if (property.facilities.includes("parking"))
    faqs.push({ q: "Can I park there?", a: "Yes — free parking is available." });
  if (property.facilities.includes("pool"))
    faqs.push({ q: "Is there a swimming pool?", a: "Yes — a swimming pool is available." });
  if (property.facilities.includes("airport_shuttle"))
    faqs.push({ q: "Is airport shuttle available?", a: "Yes — airport shuttle service is offered." });
  if (houseRules?.petsPolicy === "allowed")
    faqs.push({ q: "Are pets allowed?", a: "Yes — pets are welcome." });
  else if (houseRules?.petsPolicy === "not_allowed")
    faqs.push({ q: "Are pets allowed?", a: "No — pets are not allowed at this property." });
  if (property.facilities.includes("spa"))
    faqs.push({ q: "Is there a spa?", a: "Yes — spa facilities are available." });
  if (houseRules?.checkInFrom)
    faqs.push({
      q: "What are the check-in and check-out times?",
      a: `Check-in from ${formatTime(houseRules.checkInFrom)}${houseRules.checkInTo ? ` to ${formatTime(houseRules.checkInTo)}` : ""}. ${houseRules.checkOutTo ? `Check-out by ${formatTime(houseRules.checkOutTo)}.` : ""}`,
    });

  const policyLabel: Record<string, string> = {
    allowed: "Allowed",
    not_allowed: "Not allowed",
    on_request: "On request",
    welcome: "Welcome",
    non_smoking: "Non-smoking",
    designated_areas: "Designated smoking areas only",
    no_restriction: "No age restriction",
    "18_plus": "18+ only",
    "25_plus": "25+ only",
  };

  return (
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <BackButton label="Back to Results" />
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#14213D]">
              {property.name}
            </h1>
            <p className="mt-1.5 flex items-center gap-1 text-gray-500 text-sm">
              <span className="material-symbols-outlined text-sm text-[#14213D]/40">location_on</span>
              {property.location}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 rounded-full bg-[#14213D] px-4 py-1.5 text-sm font-bold text-white">
              <span className="material-symbols-outlined text-[#D9A94D] text-sm filled">star</span>
              {property.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">{property.reviews.toLocaleString()} reviews</span>
          </div>
        </div>

        <PropertyGallery gallery={galleryImages} propertyName={property.name} />

        {/* Most popular facilities strip */}
        {property.facilities.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {property.facilities.slice(0, 8).map((key) => {
              const f = getFacilityByKey(key);
              if (!f) return null;
              return (
                <span key={key} className="flex items-center gap-1.5 rounded-full bg-[#14213D]/8 border border-[#14213D]/12 px-3 py-1.5 text-xs font-medium text-[#14213D]">
                  <span className="material-symbols-outlined text-xs">{f.icon}</span>
                  {f.label}
                </span>
              );
            })}
            {property.facilities.length > 8 && (
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500">
                +{property.facilities.length - 8} more
              </span>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <section>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-4">About this property</h2>
              <p className="leading-7 text-gray-600 text-sm">{property.description}</p>
            </section>

            {/* Full Facilities */}
            {property.facilities.length > 0 && (
              <section>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-5">Facilities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.facilities.map((key) => {
                    const f = getFacilityByKey(key);
                    if (!f) return null;
                    return (
                      <div key={key} className="flex items-center gap-2.5 rounded-lg bg-white border border-gray-100 p-3.5 shadow-sm text-sm text-gray-700">
                        <span className="material-symbols-outlined text-[#14213D] text-base">{f.icon}</span>
                        {f.label}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Legacy amenities */}
            {property.amenities.length > 0 && (
              <section>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-4">Amenities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 rounded-lg bg-white border border-gray-100 p-3.5 shadow-sm text-sm text-gray-700">
                      <span className="material-symbols-outlined text-[#D9A94D] text-sm">check_circle</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* House Rules */}
            {houseRules && Object.values(houseRules).some(Boolean) && (
              <section>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-5">House Rules</h2>
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                  {houseRules.checkInFrom && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">login</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Check-in</span>
                        <span className="text-sm text-[#14213D]">
                          From {formatTime(houseRules.checkInFrom)}{houseRules.checkInTo ? ` to ${formatTime(houseRules.checkInTo)}` : ""}
                        </span>
                      </div>
                    </div>
                  )}
                  {houseRules.checkOutTo && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">logout</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Check-out</span>
                        <span className="text-sm text-[#14213D]">
                          {houseRules.checkOutFrom ? `From ${formatTime(houseRules.checkOutFrom)} to ` : "By "}{formatTime(houseRules.checkOutTo)}
                        </span>
                      </div>
                    </div>
                  )}
                  {(houseRules.cancellationPolicy || houseRules.prepaymentPolicy) && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">info</span>
                      <div className="flex-1">
                        <span className="font-semibold text-[#14213D] text-sm block mb-1">Cancellation / prepayment</span>
                        {houseRules.cancellationPolicy && <p className="text-sm text-[#14213D]">{houseRules.cancellationPolicy}</p>}
                        {houseRules.prepaymentPolicy && <p className="text-sm text-[#14213D] mt-0.5">{houseRules.prepaymentPolicy}</p>}
                      </div>
                    </div>
                  )}
                  {(houseRules.childrenPolicy || houseRules.cribsAvailable !== undefined || houseRules.extraBedsAvailable !== undefined) && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">child_care</span>
                      <div className="flex-1">
                        <span className="font-semibold text-[#14213D] text-sm block mb-1">Children &amp; Beds</span>
                        {houseRules.childrenPolicy && <p className="text-sm text-[#14213D]">{policyLabel[houseRules.childrenPolicy] ?? houseRules.childrenPolicy}</p>}
                        {houseRules.cribsAvailable !== undefined && <p className="text-sm text-[#14213D] mt-0.5">{houseRules.cribsAvailable ? "Cribs available on request" : "No cribs available"}</p>}
                        {houseRules.extraBedsAvailable !== undefined && <p className="text-sm text-[#14213D] mt-0.5">{houseRules.extraBedsAvailable ? "Extra beds available" : "No extra beds"}</p>}
                      </div>
                    </div>
                  )}
                  {houseRules.ageRestriction && houseRules.ageRestriction !== "no_restriction" && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">person</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Age restriction</span>
                        <span className="text-sm text-[#14213D]">{policyLabel[houseRules.ageRestriction] ?? houseRules.ageRestriction}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.petsPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">pets</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Pets</span>
                        <span className="text-sm text-[#14213D]">{policyLabel[houseRules.petsPolicy] ?? houseRules.petsPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.smokingPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">smoke_free</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Smoking</span>
                        <span className="text-sm text-[#14213D]">{policyLabel[houseRules.smokingPolicy] ?? houseRules.smokingPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.partiesPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-gray-50">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">celebration</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Parties / events</span>
                        <span className="text-sm text-[#14213D]">{policyLabel[houseRules.partiesPolicy] ?? houseRules.partiesPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.quietHours && (
                    <div className="flex items-start gap-4 px-6 py-4">
                      <span className="material-symbols-outlined text-[#14213D]/40 text-lg mt-0.5">nightlight</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213D] text-sm">Quiet hours</span>
                        <span className="text-sm text-[#14213D]">{houseRules.quietHours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Area Info */}
            {areaInfo && Object.values(areaInfo).some((arr) => arr && arr.length > 0) && (
              <section>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-5">Hotel Area Info</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Attractions */}
                  {areaInfo.attractions && areaInfo.attractions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">attractions</span>
                        Top Attractions
                      </p>
                      <div className="space-y-2">
                        {areaInfo.attractions.map((a, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{a.type && <span className="text-gray-400 text-xs">{a.type} · </span>}{a.name}</span>
                            {a.distance != null && <span className="text-[#14213D] font-medium shrink-0 ml-2">{formatDistance(a)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Restaurants */}
                  {areaInfo.restaurants && areaInfo.restaurants.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">restaurant</span>
                        Restaurants &amp; Cafes
                      </p>
                      <div className="space-y-2">
                        {areaInfo.restaurants.map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700">{r.type && <span className="text-gray-400 text-xs">{r.type} · </span>}{r.name}</span>
                            {r.distance != null && <span className="text-[#14213D] font-medium shrink-0 ml-2">{formatDistance(r)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Transit + Airports + Nature stacked in third column */}
                  <div className="space-y-5">
                    {areaInfo.transit && areaInfo.transit.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">train</span>
                          Public Transit
                        </p>
                        <div className="space-y-2">
                          {areaInfo.transit.map((t, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{t.type && <span className="text-gray-400 text-xs">{t.type} · </span>}{t.name}</span>
                              {t.distance != null && <span className="text-[#14213D] font-medium shrink-0 ml-2">{formatDistance(t)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {areaInfo.airports && areaInfo.airports.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">flight</span>
                          Closest Airports
                        </p>
                        <div className="space-y-2">
                          {areaInfo.airports.map((a, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{a.name}</span>
                              {a.distance != null && <span className="text-[#14213D] font-medium shrink-0 ml-2">{formatDistance(a)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {areaInfo.naturalBeauty && areaInfo.naturalBeauty.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">landscape</span>
                          Natural Beauty
                        </p>
                        <div className="space-y-2">
                          {areaInfo.naturalBeauty.map((n, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700">{n.type && <span className="text-gray-400 text-xs">{n.type} · </span>}{n.name}</span>
                              {n.distance != null && <span className="text-[#14213D] font-medium shrink-0 ml-2">{formatDistance(n)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Nearby Highlights */}
            {property.nearbyHighlights.length > 0 && (
              <NearbyHighlightsSection highlights={property.nearbyHighlights} />
            )}

            {/* Travellers are asking (FAQ) */}
            {faqs.length > 0 && (
              <section>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D] mb-5">Travellers are asking</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#14213D]/30 text-base mt-0.5 shrink-0">chat_bubble_outline</span>
                        <div>
                          <p className="text-sm font-semibold text-[#14213D] leading-snug">{faq.q}</p>
                          <p className="mt-1 text-sm text-[#14213D]">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* User Photos */}
            <UserPhotoSection
              propertyId={property.id}
              propertyName={property.name}
              approvedPhotos={property.userPhotos}
              isLoggedIn={!!currentUser}
            />

          </div>

          {/* Booking sidebar */}
          <BookingForm
            propertyId={property.id}
            propertyName={property.name}
            pricePerNight={property.price}
          />
        </div>
      </div>
    </main>
  );
}
