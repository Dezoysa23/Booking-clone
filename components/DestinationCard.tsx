import Image from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

export default function DestinationCard({ title, subtitle, image, href }: Props) {
  return (
    <Link href={href} className="group block relative overflow-hidden rounded-2xl">
      <div className="relative h-48 md:h-56 w-full overflow-hidden rounded-2xl">
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f3d]/80 via-[#0f1f3d]/20 to-transparent" />

        {/* Arrow icon — appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-[#D8B45A] rounded-full p-1.5">
            <span className="material-symbols-outlined text-[#0f1f3d] text-sm">arrow_forward</span>
          </div>
        </div>

        {/* Text */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-[family-name:var(--font-playfair-display)] text-white text-base md:text-lg font-semibold leading-tight">
            {title}
          </p>
          <p className="text-white/65 text-xs mt-0.5 leading-relaxed">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
