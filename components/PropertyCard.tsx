import Link from "next/link";

type Props = {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
};

export default function PropertyCard({
  id,
  name,
  location,
  rating,
  price,
  image,
}: Props) {
  return (
    <Link href={`/properties/${id}`}>
      <div className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl">
        <div
          className="h-56 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>

          <p className="mt-1 text-sm text-gray-500">{location}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-700 px-2 py-1 text-sm font-bold text-white">
                {rating}
              </span>
              <span className="text-sm text-gray-700">Excellent</span>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Per night</p>
              <p className="text-lg font-bold text-gray-900">
                LKR {price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}