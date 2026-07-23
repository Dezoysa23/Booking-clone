import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isHostOrAdmin(currentUser)) redirect("/pricing");

  return (
    <div className="min-h-screen bg-[#F8F2E9]">
      {/* Host sidebar nav */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/host/dashboard" className="flex items-center gap-2.5">
              <Image
                src="/brand/pearlora-logo.jpg"
                alt="Pearlora"
                width={28}
                height={28}
                className="rounded object-contain"
                unoptimized
              />
              <span className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
                Host Portal
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { href: "/host/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/host/properties", label: "Properties", icon: "apartment" },
                { href: "/host/billing", label: "Billing", icon: "receipt_long" },
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#3B4658] hover:bg-[#14213D]/5 hover:text-[#14213D] transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">{icon}</span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#5B6472] hover:text-[#14213D] transition-colors"
            >
              <span className="material-symbols-outlined text-xs">open_in_new</span>
              View site
            </Link>
            <Link
              href="/host/properties/new"
              className="rounded-lg bg-[#14213D] px-4 py-2 text-xs font-semibold text-white hover:bg-[#16233F] transition-colors"
            >
              + Add Property
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
