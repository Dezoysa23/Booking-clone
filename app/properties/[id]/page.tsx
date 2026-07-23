import Link from "next/link";
import { notFound } from "next/navigation";
import StickyPriceHeader from "@/components/StickyPriceHeader";
import MobileBookingBar from "@/components/MobileBookingBar";
import { SafeImage } from "@/components/SafeImage";
import BookingForm from "@/components/BookingForm";
import PropertyGallery from "@/components/PropertyGallery";
import UserPhotoSection from "@/components/UserPhotoSection";
import NearbyHighlightsSection from "@/components/NearbyHighlightsSection";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFacilityByKey } from "@/lib/property-constants";

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ checkIn?: string; checkOut?: string }>;
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

export default async function PropertyDetailsPage({
  params,
  searchParams,
}: PropertyDetailsPageProps) {
  const resolvedParams = await params;
  const { checkIn: qCheckIn, checkOut: qCheckOut } = await searchParams;
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
    <main className="min-h-screen">
      <StickyPriceHeader
        name={property.name}
        rating={property.rating}
        price={property.price}
        watchId="detail-title"
      />

      {/* Full-bleed hero — the navbar rides transparent over this (parity with Home) */}
      <section className="relative h-[68svh] min-h-130 w-full overflow-hidden">
        <SafeImage
          src={galleryImages[0]}
          alt={property.name}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#14213d]/75 via-[#14213d]/35 to-[#101a30]/90" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-between px-4 pb-10 pt-24 md:px-6">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-sm text-white/70"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              chevron_right
            </span>
            <Link href="/results" className="transition-colors hover:text-white">
              Stays
            </Link>
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              chevron_right
            </span>
            <span className="truncate font-medium text-white">{property.name}</span>
          </nav>

          {/* Title block (scroll sentinel for the sticky mini-header) */}
          <div id="detail-title" className="scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm font-bold text-white backdrop-blur">
                <span className="material-symbols-outlined filled text-sm text-[#e8c892]">
                  star
                </span>
                {property.rating.toFixed(1)}
              </span>
              <span className="text-sm text-white/75">
                {property.reviews.toLocaleString()} reviews
              </span>
            </div>
            <h1 className="max-w-3xl font-(family-name:--font-playfair-display) text-4xl font-semibold leading-[1.05] text-white [text-shadow:0_2px_24px_rgba(9,15,30,0.4)] md:text-5xl">
              {property.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-white/85">
                <span className="material-symbols-outlined text-[#e8c892]">
                  location_on
                </span>
                {property.location}
              </p>
              <p className="text-white/80">
                from{" "}
                <span className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-white">
                  LKR {property.price.toLocaleString()}
                </span>
                <span className="text-sm">/night</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-gradient">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
          <PropertyGallery gallery={galleryImages} propertyName={property.name} />

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">

            {/* About */}
            <section>
              <h2 className="mb-4 font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">About this property</h2>
              <p className="text-[15px] leading-7 text-[#3b4658]">{property.description}</p>
            </section>

            {/* Facilities — signature glassmorphic dark panel */}
            {property.facilities.length > 0 && (
              <section className="section-navy relative overflow-hidden rounded-3xl p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#d9a94d]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e8c892]">
                    What this place offers
                  </span>
                </div>
                <h2 className="mb-6 font-(family-name:--font-playfair-display) text-2xl font-semibold text-white">
                  Facilities &amp; Services
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {property.facilities.map((key) => {
                    const f = getFacilityByKey(key);
                    if (!f) return null;
                    return (
                      <div key={key} className="glass-panel-dark flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white">
                        <span className="material-symbols-outlined text-[#e8c892]">{f.icon}</span>
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
                <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d] mb-4">Amenities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2.5 rounded-lg bg-white border border-slate-200/70 p-3.5 shadow-sm text-sm text-slate-700">
                      <span className="material-symbols-outlined text-[#d9a94d] text-sm">check_circle</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* House Rules */}
            {houseRules && Object.values(houseRules).some(Boolean) && (
              <section>
                <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d] mb-5">House Rules</h2>
                <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm overflow-hidden">
                  {houseRules.checkInFrom && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">login</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Check-in</span>
                        <span className="text-sm text-[#14213d]">
                          From {formatTime(houseRules.checkInFrom)}{houseRules.checkInTo ? ` to ${formatTime(houseRules.checkInTo)}` : ""}
                        </span>
                      </div>
                    </div>
                  )}
                  {houseRules.checkOutTo && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">logout</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Check-out</span>
                        <span className="text-sm text-[#14213d]">
                          {houseRules.checkOutFrom ? `From ${formatTime(houseRules.checkOutFrom)} to ` : "By "}{formatTime(houseRules.checkOutTo)}
                        </span>
                      </div>
                    </div>
                  )}
                  {(houseRules.cancellationPolicy || houseRules.prepaymentPolicy) && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">info</span>
                      <div className="flex-1">
                        <span className="font-semibold text-[#14213d] text-sm block mb-1">Cancellation / prepayment</span>
                        {houseRules.cancellationPolicy && <p className="text-sm text-[#14213d]">{houseRules.cancellationPolicy}</p>}
                        {houseRules.prepaymentPolicy && <p className="text-sm text-[#14213d] mt-0.5">{houseRules.prepaymentPolicy}</p>}
                      </div>
                    </div>
                  )}
                  {(houseRules.childrenPolicy || houseRules.cribsAvailable !== undefined || houseRules.extraBedsAvailable !== undefined) && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">child_care</span>
                      <div className="flex-1">
                        <span className="font-semibold text-[#14213d] text-sm block mb-1">Children &amp; Beds</span>
                        {houseRules.childrenPolicy && <p className="text-sm text-[#14213d]">{policyLabel[houseRules.childrenPolicy] ?? houseRules.childrenPolicy}</p>}
                        {houseRules.cribsAvailable !== undefined && <p className="text-sm text-[#14213d] mt-0.5">{houseRules.cribsAvailable ? "Cribs available on request" : "No cribs available"}</p>}
                        {houseRules.extraBedsAvailable !== undefined && <p className="text-sm text-[#14213d] mt-0.5">{houseRules.extraBedsAvailable ? "Extra beds available" : "No extra beds"}</p>}
                      </div>
                    </div>
                  )}
                  {houseRules.ageRestriction && houseRules.ageRestriction !== "no_restriction" && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">person</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Age restriction</span>
                        <span className="text-sm text-[#14213d]">{policyLabel[houseRules.ageRestriction] ?? houseRules.ageRestriction}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.petsPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">pets</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Pets</span>
                        <span className="text-sm text-[#14213d]">{policyLabel[houseRules.petsPolicy] ?? houseRules.petsPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.smokingPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">smoke_free</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Smoking</span>
                        <span className="text-sm text-[#14213d]">{policyLabel[houseRules.smokingPolicy] ?? houseRules.smokingPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.partiesPolicy && (
                    <div className="flex items-start gap-4 px-6 py-4 border-b border-slate-100">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">celebration</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Parties / events</span>
                        <span className="text-sm text-[#14213d]">{policyLabel[houseRules.partiesPolicy] ?? houseRules.partiesPolicy}</span>
                      </div>
                    </div>
                  )}
                  {houseRules.quietHours && (
                    <div className="flex items-start gap-4 px-6 py-4">
                      <span className="material-symbols-outlined text-[#14213d]/40 text-lg mt-0.5">nightlight</span>
                      <div className="flex-1 flex justify-between flex-wrap gap-2">
                        <span className="font-semibold text-[#14213d] text-sm">Quiet hours</span>
                        <span className="text-sm text-[#14213d]">{houseRules.quietHours}</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Area Info */}
            {areaInfo && Object.values(areaInfo).some((arr) => arr && arr.length > 0) && (
              <section>
                <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d] mb-5">Hotel Area Info</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Attractions */}
                  {areaInfo.attractions && areaInfo.attractions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">attractions</span>
                        Top Attractions
                      </p>
                      <div className="space-y-2">
                        {areaInfo.attractions.map((a, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-700">{a.type && <span className="text-slate-400 text-xs">{a.type} · </span>}{a.name}</span>
                            {a.distance != null && <span className="text-[#14213d] font-medium shrink-0 ml-2">{formatDistance(a)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Restaurants */}
                  {areaInfo.restaurants && areaInfo.restaurants.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d] mb-3 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">restaurant</span>
                        Restaurants &amp; Cafes
                      </p>
                      <div className="space-y-2">
                        {areaInfo.restaurants.map((r, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-slate-700">{r.type && <span className="text-slate-400 text-xs">{r.type} · </span>}{r.name}</span>
                            {r.distance != null && <span className="text-[#14213d] font-medium shrink-0 ml-2">{formatDistance(r)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Transit + Airports + Nature stacked in third column */}
                  <div className="space-y-5">
                    {areaInfo.transit && areaInfo.transit.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">train</span>
                          Public Transit
                        </p>
                        <div className="space-y-2">
                          {areaInfo.transit.map((t, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-700">{t.type && <span className="text-slate-400 text-xs">{t.type} · </span>}{t.name}</span>
                              {t.distance != null && <span className="text-[#14213d] font-medium shrink-0 ml-2">{formatDistance(t)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {areaInfo.airports && areaInfo.airports.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">flight</span>
                          Closest Airports
                        </p>
                        <div className="space-y-2">
                          {areaInfo.airports.map((a, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-700">{a.name}</span>
                              {a.distance != null && <span className="text-[#14213d] font-medium shrink-0 ml-2">{formatDistance(a)}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {areaInfo.naturalBeauty && areaInfo.naturalBeauty.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d] mb-3 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">landscape</span>
                          Natural Beauty
                        </p>
                        <div className="space-y-2">
                          {areaInfo.naturalBeauty.map((n, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-slate-700">{n.type && <span className="text-slate-400 text-xs">{n.type} · </span>}{n.name}</span>
                              {n.distance != null && <span className="text-[#14213d] font-medium shrink-0 ml-2">{formatDistance(n)}</span>}
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
                <h2 className="font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d] mb-5">Travellers are asking</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl bg-white border border-slate-200/70 shadow-sm p-4">
                      <div className="flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-[#14213d]/30 text-base mt-0.5 shrink-0">chat_bubble_outline</span>
                        <div>
                          <p className="text-sm font-semibold text-[#14213d] leading-snug">{faq.q}</p>
                          <p className="mt-1 text-sm text-[#14213d]">{faq.a}</p>
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
            defaultCheckIn={qCheckIn}
            defaultCheckOut={qCheckOut}
          />
        </div>
        </div>
      </div>

      <MobileBookingBar price={property.price} />
    </main>
  );
}
