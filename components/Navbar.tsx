import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin, isHostOrAdmin } from "@/lib/roles";
import LogoutButton from "@/components/LogoutButton";
import NavLinks from "@/components/NavLinks";
import MobileNav from "@/components/MobileNav";
import SuperAdminCalendarWidget from "@/components/SuperAdminCalendarWidget";
import { NavbarChrome } from "@/components/NavbarChrome";

export default async function Navbar() {
  const currentUser = await getCurrentUser();

  const loggedIn = !!currentUser;
  const superAdmin = currentUser ? isSuperAdmin(currentUser) : false;
  const showHostPortal = currentUser
    ? isHostOrAdmin(currentUser) && !superAdmin
    : false;
  const displayName = currentUser?.name || currentUser?.email || "";

  return (
    <NavbarChrome>
      <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          >
            <Image
              src="/brand/Pearlora-logo-only.png"
              alt="Pearlora"
              width={32}
              height={32}
              className="shrink-0 rounded-md object-contain"
            />
            <span className="font-(family-name:--font-playfair-display)">
              Pearlora
            </span>
          </Link>

          <NavLinks />
          {superAdmin ? (
            <span className="hidden md:block">
              <SuperAdminCalendarWidget />
            </span>
          ) : null}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {loggedIn ? (
            <>
              {superAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm font-semibold tracking-wide text-[#e8c892] transition-colors hover:text-[#e8c892]"
                >
                  Admin
                </Link>
              ) : null}
              {showHostPortal ? (
                <Link
                  href="/host/dashboard"
                  className="text-sm font-semibold tracking-wide text-[#e8c892] transition-colors hover:text-[#e8c892]"
                >
                  Host Portal
                </Link>
              ) : null}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-white/10"
              >
                <span className="material-symbols-outlined text-sm text-[#e8c892]" aria-hidden="true">
                  person
                </span>
                <span className="max-w-35 truncate text-sm font-medium text-white/80">
                  {displayName}
                </span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/pricing"
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Host your property
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-[#d9a94d] px-5 py-2 text-sm font-bold tracking-wide text-[#14213d] shadow-sm transition-colors hover:bg-[#e8c892]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <MobileNav
          isLoggedIn={loggedIn}
          showAdmin={superAdmin}
          showHostPortal={showHostPortal}
          name={displayName}
        />
    </NavbarChrome>
  );
}
