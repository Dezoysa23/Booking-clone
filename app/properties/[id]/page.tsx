import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import BookingForm from "@/components/BookingForm";
import { prisma } from "@/lib/prisma";

type PropertyDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
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

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <BackButton label="Back" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">{property.name}</h1>
        <p className="mt-2 text-lg text-gray-600">{property.location}</p>

        <div className="mt-4 flex items-center gap-3">
          <span className="rounded-md bg-blue-700 px-3 py-1 text-sm font-bold text-white">
            {property.rating}
          </span>
          <span className="text-gray-700">
            Excellent · {property.reviews} reviews
          </span>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {property.gallery.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${property.name} image ${index + 1}`}
              className="h-64 w-full rounded-2xl object-cover shadow-md"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="leading-7 text-gray-700">{property.description}</p>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900">Amenities</h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
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