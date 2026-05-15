import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import BookingForm from "@/components/BookingForm";
import PropertyGallery from "@/components/PropertyGallery";
import { prisma } from "@/lib/prisma";

type PropertyDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailsPage({
  params,
}: PropertyDetailsPageProps) {
  const resolvedParams = await params;
  const propertyId = Number(resolvedParams.id);

  if (Number.isNaN(propertyId)) {
    notFound();
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    notFound();
  }

  const galleryImages =
    property.gallery.length > 0 ? property.gallery : [property.image];

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <BackButton label="Back to Results" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl md:text-4xl font-semibold text-[#0f1f3d]">
              {property.name}
            </h1>
            <p className="mt-1.5 flex items-center gap-1 text-gray-500 text-sm">
              <span className="material-symbols-outlined text-sm text-[#0f1f3d]/40">location_on</span>
              {property.location}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 rounded-full bg-[#0f1f3d] px-4 py-1.5 text-sm font-bold text-white">
              <span className="material-symbols-outlined text-[#c9a84c] text-sm filled">star</span>
              {property.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              {property.reviews.toLocaleString()} reviews
            </span>
          </div>
        </div>

        <PropertyGallery
          gallery={galleryImages}
          propertyName={property.name}
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d] mb-4">
                About this property
              </h2>
              <p className="leading-7 text-gray-600 text-sm">{property.description}</p>
            </div>

            {property.amenities.length > 0 && (
              <div>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#0f1f3d] mb-4">
                  Amenities
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 rounded-lg bg-white border border-gray-100 p-3.5 shadow-sm text-sm text-gray-700"
                    >
                      <span className="material-symbols-outlined text-[#c9a84c] text-sm">check_circle</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
