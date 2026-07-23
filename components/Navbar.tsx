import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin, isHostOrAdmin } from "@/lib/roles";
import LogoutButton from "@/components/LogoutButton";
import NavLinks from "@/components/NavLinks";
import SuperAdminCalendarWidget from "@/components/SuperAdminCalendarWidget";

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  return (
    <header className="bg-[#0f1f3d] w-full top-0 sticky z-50 border-b border-white/10">
      <div className="flex justify-between items-center w-full px-4 md:px-16 py-4 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white font-bold text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <Image
              src="/brand/pearlora-logo.svg"
              alt="Pearlora"
              width={32}
              height={32}
              className="rounded-md object-contain shrink-0"
              unoptimized
            />
            <span className="font-[family-name:var(--font-playfair-display)]">
              Pearlora
            </span>
          </Link>

          <NavLinks />
          {currentUser && isSuperAdmin(currentUser) && (
            <SuperAdminCalendarWidget />
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {isSuperAdmin(currentUser) && (
                <Link
                  href="/admin"
                  className="text-[#D8B45A] hover:text-[#e8c96a] text-sm font-semibold tracking-wide transition-colors"
                >
                  Admin
                </Link>
              )}
              {isHostOrAdmin(currentUser) && !isSuperAdmin(currentUser) && (
                <Link
                  href="/host/dashboard"
                  className="text-[#D8B45A] hover:text-[#e8c96a] text-sm font-semibold tracking-wide transition-colors"
                >
                  Host Portal
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[#D8B45A] text-sm">
                  person
                </span>
                <span className="hidden md:inline text-white/75 text-sm font-medium max-w-[140px] truncate">
                  {currentUser.name || currentUser.email}
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className="hidden md:block text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Host your property
              </Link>
              <Link
                href="/login"
                className="hidden md:block text-white/60 hover:text-white text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#D8B45A] text-[#0f1f3d] text-sm font-bold px-5 py-2 rounded-full hover:bg-[#c9a84c] transition-colors tracking-wide"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
