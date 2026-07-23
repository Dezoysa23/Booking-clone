"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: number;
  image: string;
};

export default function PropertyCard({ id, name, location, rating, price, image }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_16px_48px_rgba(15,31,61,0.14)] transition-shadow duration-300 border border-gray-100 hover:border-[#D9A94D]/30 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-60 overflow-hidden shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          style={{ objectFit: "cover" }}
          className="group-hover:scale-[1.06] transition-transform duration-500 ease-out"
        />
        {/* Subtle bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#14213D]/50 to-transparent pointer-events-none" />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 bg-[#14213D]/85 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#D9A94D] text-sm filled">star</span>
          <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
        </div>

        {/* View detail caret — appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-[#D9A94D] rounded-full p-1.5">
            <span className="material-symbols-outlined text-[#14213D] text-sm">open_in_new</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#14213D] leading-snug line-clamp-2">
          {name}
        </h3>
        <p className="mt-1.5 text-sm text-[#5B6472] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-[#14213D]/40">location_on</span>
          {location}
        </p>

        {/* Price + CTA row */}
        <div className="mt-auto pt-5 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#7C879B]">From</span>
            <p className="text-xl font-bold text-[#14213D] leading-tight mt-0.5">
              LKR {price.toLocaleString()}
              <span className="text-xs font-normal text-[#7C879B]"> /night</span>
            </p>
          </div>
          <Link
            href={`/properties/${id}`}
            className="rounded-xl bg-[#14213D] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#D9A94D] hover:text-[#14213D] transition-all duration-200 flex items-center gap-1.5 shrink-0"
          >
            View Details
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
