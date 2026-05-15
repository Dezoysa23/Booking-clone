import Image from "next/image";
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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative h-60 overflow-hidden shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0f1f3d]/40 to-transparent pointer-events-none" />
        <div className="absolute top-3 left-3 bg-[#0f1f3d]/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#D8B45A] text-sm filled">
            star
          </span>
          <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d] leading-snug">
          {name}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-[#071B63]/40">
            location_on
          </span>
          {location}
        </p>

        <div className="mt-auto pt-5 flex items-end justify-between">
          <div>
            <span className="text-xs text-gray-400">from</span>
            <p className="text-lg font-bold text-[#0f1f3d] leading-tight">
              LKR {price.toLocaleString()}
              <span className="text-xs font-normal text-gray-400"> /night</span>
            </p>
          </div>
          <Link
            href={`/properties/${id}`}
            className="rounded-xl bg-[#071B63] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123EAF] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
