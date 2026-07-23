import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/",                 label: "Home" },
  { href: "/results",          label: "Browse Properties" },
  { href: "/pricing",          label: "Host Pricing" },
  { href: "/become-a-host",    label: "Become a Host" },
  { href: "/how-it-works",     label: "How It Works" },
];

const ACCOUNT_LINKS = [
  { href: "/bookings", label: "My Bookings" },
  { href: "/account",  label: "My Account" },
  { href: "/login",    label: "Sign In" },
  { href: "/signup",   label: "Create Account" },
];

const SUPPORT_LINKS = [
  { href: "/how-it-works",  label: "Guest Guide" },
  { href: "/become-a-host", label: "Host Guide" },
  { href: "/pricing",       label: "Subscription Plans" },
];

export default function Footer() {
  return (
    <footer className="w-full mt-[120px] bg-[#0a1628] text-white border-t border-[#D9A94D]/15">
      {/* Gold shimmer top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#D9A94D]/30 to-transparent" />

      <div className="max-w-[1280px] mx-auto px-4 md:px-16 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/brand/pearlora-logo.jpg"
                alt="Pearlora"
                width={30}
                height={30}
                className="rounded object-contain shrink-0"
                unoptimized
              />
              <span className="font-[family-name:var(--font-playfair-display)] text-white text-2xl font-semibold">
                Pearlora
              </span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-[200px]">
              From Coastlines to Hilltops — extraordinary stays, curated for you.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-px flex-1 bg-[#D9A94D]/15" />
              <span className="text-[#D9A94D]/50 text-[10px] font-semibold tracking-[0.18em] uppercase">Sri Lanka</span>
              <span className="h-px flex-1 bg-[#D9A94D]/15" />
            </div>
          </div>

          {/* Navigate */}
          <div className="flex flex-col gap-4">
            <p className="text-[#D9A94D] text-[10px] font-bold tracking-[0.22em] uppercase">Explore</p>
            <div className="flex flex-col gap-2.5 text-sm">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-white/50 hover:text-white transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-4">
            <p className="text-[#D9A94D] text-[10px] font-bold tracking-[0.22em] uppercase">Account</p>
            <div className="flex flex-col gap-2.5 text-sm">
              {ACCOUNT_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-white/50 hover:text-white transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <p className="text-[#D9A94D] text-[10px] font-bold tracking-[0.22em] uppercase">Support</p>
            <div className="flex flex-col gap-2.5 text-sm">
              {SUPPORT_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="text-white/50 hover:text-[#D9A94D] transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/25">Contact</p>
              <p className="text-white/40 text-xs">gopearlora@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} Pearlora. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/25">
            <span>Privacy Policy</span>
            <span className="h-3 w-px bg-white/15" />
            <span>Terms of Service</span>
            <span className="h-3 w-px bg-white/15" />
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
