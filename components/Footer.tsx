import Image from "next/image";
import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/results", label: "Browse Stays" },
      { href: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { href: "/become-a-host", label: "Become a Host" },
      { href: "/pricing", label: "Host Pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/bookings", label: "My Bookings" },
      { href: "/account", label: "My Account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="section-navy w-full text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/Pearlora-logo-only.png"
                alt="Pearlora"
                width={28}
                height={28}
                className="shrink-0 rounded object-contain"
              />
              <span className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-white">
                Pearlora
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/55">
              From coastlines to hilltops — curated stays across Sri Lanka&apos;s
              most breathtaking destinations.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#e8c892]">
                {col.title}
              </p>
              <div className="flex flex-col gap-3 text-sm">
                {col.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="w-fit text-white/55 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Pearlora. All rights reserved.</p>
          <p>Sri Lanka&apos;s premier stay-booking platform.</p>
        </div>
      </div>
    </footer>
  );
}
