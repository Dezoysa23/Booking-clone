import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-[120px] bg-[#0f1f3d] text-white py-14 px-4 md:px-16 border-t border-[#D8B45A]/20">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/pearlora-logo.svg"
              alt="Pearlora"
              width={28}
              height={28}
              className="rounded object-contain shrink-0"
              unoptimized
            />
            <span className="font-[family-name:var(--font-playfair-display)] text-white text-2xl font-semibold">
              Pearlora
            </span>
          </div>
          <p className="text-white/55 text-sm max-w-xs leading-relaxed">
            From Coastlines to Hilltops, Stay Pearlora.
          </p>
          <p className="text-white/30 text-xs mt-1">
            © {new Date().getFullYear()} Pearlora. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase">
            Navigate
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href="/"
              className="text-white/55 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/bookings"
              className="text-white/55 hover:text-white transition-colors"
            >
              My Bookings
            </Link>
            <Link
              href="/account"
              className="text-white/55 hover:text-white transition-colors"
            >
              My Account
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-[#D8B45A] text-xs font-semibold tracking-widest uppercase">
            Support
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <a
              href="#"
              className="text-white/55 hover:text-[#D8B45A] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-white/55 hover:text-[#D8B45A] transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-white/55 hover:text-[#D8B45A] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
