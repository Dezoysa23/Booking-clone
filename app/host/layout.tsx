import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin } from "@/lib/roles";
import { buttonVariants } from "@/components/ui";
import HostMobileNav from "@/components/HostMobileNav";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isHostOrAdmin(currentUser)) redirect("/pricing");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Host portal nav */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:gap-6">
            <HostMobileNav />
            <Link href="/host/dashboard" className="flex items-center gap-2.5">
              <Image
                src="/brand/Pearlora-logo-only.png"
                alt="Pearlora"
                width={28}
                height={28}
                className="rounded object-contain"
              />
              <span className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
                Host Portal
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {[
                { href: "/host/dashboard", label: "Dashboard", icon: "dashboard" },
                { href: "/host/properties", label: "Properties", icon: "apartment" },
                { href: "/host/billing", label: "Billing", icon: "receipt_long" },
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-[#f4ecd8] hover:text-[#14213d]"
                >
                  <span className="material-symbols-outlined text-lg leading-none">
                    {icon}
                  </span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1 text-xs text-slate-500 transition-colors hover:text-[#14213d] sm:inline-flex"
            >
              <span className="material-symbols-outlined text-base leading-none">
                open_in_new
              </span>
              View site
            </Link>
            <Link
              href="/host/properties/new"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              <span className="material-symbols-outlined text-lg leading-none">add</span>
              Add Property
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
