"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  title: string;
  subtitle: string;
  image: string;
  href: string;
};

export default function DestinationCard({ title, subtitle, image, href }: Props) {
  return (
    <Link href={href} className="group block">
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative h-52 md:h-60 w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-[0_12px_36px_rgba(15,31,61,0.16)] transition-shadow duration-300"
      >
        <Image
          src={image}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
          className="group-hover:scale-[1.07] transition-transform duration-600 ease-out"
        />

        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060f22]/85 via-[#0f1f3d]/20 to-transparent" />

        {/* Hover overlay brightener */}
        <div className="absolute inset-0 bg-[#071B63]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Arrow badge — appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
          <div className="bg-[#D8B45A] rounded-full p-1.5 shadow-md">
            <span className="material-symbols-outlined text-[#0f1f3d] text-sm">arrow_forward</span>
          </div>
        </div>

        {/* Text */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-[family-name:var(--font-playfair-display)] text-white text-base md:text-lg font-semibold leading-tight">
            {title}
          </p>
          <p className="text-white/60 text-xs mt-0.5 leading-relaxed group-hover:text-white/80 transition-colors duration-200">
            {subtitle}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
