import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { buttonVariants } from "@/components/ui";

type Props = {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
  /** Optional stay dates carried into the detail link to prefill the booking form. */
  checkIn?: string;
  checkOut?: string;
};

export default function PropertyCard({
  id,
  name,
  location,
  rating,
  price,
  image,
  checkIn,
  checkOut,
}: Props) {
  const q = new URLSearchParams();
  if (checkIn) q.set("checkIn", checkIn);
  if (checkOut) q.set("checkOut", checkOut);
  const query = q.toString();
  const href = `/properties/${id}${query ? `?${query}` : ""}`;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e7ddc9] bg-white shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative h-56 shrink-0 overflow-hidden">
        <SafeImage
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-[#14213d]/45 to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#14213d]/90 px-3 py-1 backdrop-blur-sm">
          <span
            className="material-symbols-outlined filled text-sm text-[#e8c892]"
            aria-hidden="true"
          >
            star
          </span>
          <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-(family-name:--font-playfair-display) text-xl font-semibold leading-snug text-[#14213d]">
          {name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-sm text-on-surface-variant">
          <span
            className="material-symbols-outlined text-sm text-[#d9a94d]"
            aria-hidden="true"
          >
            location_on
          </span>
          {location}
        </p>

        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            <span className="text-xs text-[#7c879b]">from</span>
            <p className="text-lg font-bold leading-tight text-[#14213d]">
              LKR {price.toLocaleString()}
              <span className="text-xs font-normal text-[#7c879b]"> /night</span>
            </p>
          </div>
          <Link
            href={href}
            className={buttonVariants({
              variant: "primary",
              size: "sm",
              className: "gap-1",
            })}
          >
            View
            <span className="material-symbols-outlined text-sm" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
