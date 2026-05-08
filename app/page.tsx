import SearchBox from "@/components/SearchBox";
import DestinationCard from "@/components/DestinationCard";
import PropertyCard from "@/components/PropertyCard";
import { destinations } from "@/data/destinations";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const featuredProperties = await prisma.property.findMany({
    orderBy: [
      { rating: "desc" },
      { id: "asc" },
    ],
    take: 4,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <section className="bg-blue-900 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="max-w-3xl text-5xl font-bold leading-tight">
            Find your next stay with confidence
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-blue-100">
            Search hotels, compare prices, and book the perfect room for your
            trip.
          </p>

          <SearchBox />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900">
          Explore popular destinations
        </h2>

        <p className="mt-2 text-gray-600">
          Discover trending places travelers love to book.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {destinations.map((item) => (
            <DestinationCard
              key={item.title}
              title={item.title}
              image={item.image}
              properties={item.properties}
            />
          ))}
        </div>ssssl
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900">
          Browse featured properties
        </h2>

        <p className="mt-2 text-gray-600">
          Hand-picked stays with great ratings and value.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              location={property.location}
              rating={property.rating}
              price={property.price}
              image={property.image}
            />
          ))}
        </div>
      </section>
    </div>
  );
}