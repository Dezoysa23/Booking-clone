import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  /** Verified photo URL. When empty, an elegant branded tile is rendered. */
  image?: string;
  href: string;
};

export default function DestinationCard({ title, subtitle, image, href }: Props) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(43,32,22,0.2)]"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-2xl md:h-56">
        {image ? (
          <>
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              className="transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#14213d]/85 via-[#14213d]/20 to-transparent" />
          </>
        ) : (
          <div className="section-navy absolute inset-0">
            <span
              className="absolute right-4 top-4 font-(family-name:--font-playfair-display) text-[5.5rem] font-semibold italic leading-none text-white/6"
              aria-hidden="true"
            >
              {title.charAt(0)}
            </span>
            <span
              className="material-symbols-outlined absolute left-4 top-4 text-[#d9a94d]"
              aria-hidden="true"
            >
              location_on
            </span>
          </div>
        )}

        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-[#d9a94d] p-1.5">
            <span
              className="material-symbols-outlined text-sm text-[#14213d]"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-(family-name:--font-playfair-display) text-lg font-semibold leading-tight text-white md:text-xl">
            {title}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-white/75">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
