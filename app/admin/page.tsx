import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isSuperAdmin(currentUser)) {
    redirect("/");
  }

  const [
    propertyCount,
    bookingCount,
    pendingCount,
    confirmedCount,
    cancelledCount,
    userCount,
    avgRatingResult,
  ] = await Promise.all([
    prisma.property.count().catch(() => 0),
    prisma.booking.count().catch(() => 0),
    prisma.booking.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.booking.count({ where: { status: "CONFIRMED" } }).catch(() => 0),
    prisma.booking.count({ where: { status: "CANCELLED" } }).catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.property.aggregate({ _avg: { rating: true } }).catch(() => null),
  ]);

  const avgRating = avgRatingResult?._avg?.rating ?? null;

  return (
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="rounded-2xl admin-header-gradient px-8 py-8 mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <Image
              src="/brand/pearlora-logo.jpg"
              alt="Pearlora"
              width={28}
              height={28}
              className="rounded object-contain shrink-0"
              unoptimized
            />
            <span className="text-[#D9A94D] text-xs font-semibold tracking-widest uppercase">
              Pearlora Admin
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-white/50 text-sm">
            Manage properties and platform content. Signed in as{" "}
            <span className="text-white/75 font-medium">
              {currentUser.name || currentUser.email}
            </span>
            .
          </p>
        </div>

        {/* Analytics stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {/* Properties */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/50">
                Properties
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213D]/8">
                <span className="material-symbols-outlined text-[#14213D] text-sm">
                  apartment
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213D]">{propertyCount}</p>
              {avgRating !== null && propertyCount > 0 ? (
                <p className="mt-1 text-xs text-[#7C879B] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#D9A94D] filled text-xs">star</span>
                  Avg {avgRating.toFixed(1)} rating
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#7C879B]">Listed on Pearlora</p>
              )}
            </div>
          </div>

          {/* Registered users */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/50">
                Users
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A3A5C]/8">
                <span className="material-symbols-outlined text-[#2A3A5C] text-sm">
                  group
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213D]">{userCount}</p>
              <p className="mt-1 text-xs text-[#7C879B]">Registered accounts</p>
            </div>
          </div>

          {/* Total bookings */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/50">
                Total Bookings
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213D]/8">
                <span className="material-symbols-outlined text-[#14213D] text-sm">
                  calendar_month
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213D]">{bookingCount}</p>
              <p className="mt-1 text-xs text-[#7C879B]">All time</p>
            </div>
          </div>

          {/* Active (confirmed) bookings */}
          <div className="rounded-2xl bg-white border border-green-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-700/60">
                Active
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
                <span className="material-symbols-outlined text-green-600 text-sm">
                  check_circle
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700">{confirmedCount}</p>
              <p className="mt-1 text-xs text-green-600/60">Confirmed</p>
            </div>
          </div>

          {/* Pending bookings */}
          <div className="rounded-2xl bg-[#14213D] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D]">
                Pending
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <span className="material-symbols-outlined text-[#D9A94D] text-sm">
                  schedule
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{pendingCount}</p>
              <p className="mt-1 text-xs text-white/40">Awaiting confirmation</p>
            </div>
          </div>

          {/* Cancelled bookings */}
          <div className="rounded-2xl bg-white border border-red-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400/80">
                Cancelled
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                <span className="material-symbols-outlined text-red-400 text-sm">
                  cancel
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500">{cancelledCount}</p>
              <p className="mt-1 text-xs text-red-400/60">Cancelled bookings</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Action cards */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/40 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link
            href="/admin/properties"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#14213D]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] mb-4">
              <span className="material-symbols-outlined text-white text-base">
                apartment
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Manage Properties
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              View, edit, and delete listings.
            </p>
          </Link>

          <Link
            href="/admin/properties/new"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#D9A94D]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A94D] mb-4">
              <span className="material-symbols-outlined text-[#14213D] text-base">
                add_circle
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Add Property
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              Create a new listing.
            </p>
          </Link>

          <Link
            href="/admin/bookings"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#14213D]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D]/8 mb-4">
              <span className="material-symbols-outlined text-[#14213D] text-base">
                calendar_month
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              All Bookings
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              View and manage reservations.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#14213D]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D]/8 mb-4">
              <span className="material-symbols-outlined text-[#14213D] text-base">
                group
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Users
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              View all registered accounts.
            </p>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#D9A94D]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A94D]/15 mb-4">
              <span className="material-symbols-outlined text-[#8a6c2a] text-base">
                workspace_premium
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Subscriptions
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              Host plan subscriptions.
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-green-200 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 mb-4">
              <span className="material-symbols-outlined text-green-600 text-base">
                payments
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Payments
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              Billing and revenue history.
            </p>
          </Link>

          <Link
            href="/admin/calendar"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#D9A94D]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A94D]/10 mb-4">
              <span className="material-symbols-outlined text-[#B8860B] text-base">calendar_month</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Platform Calendar
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">Bookings, payments &amp; events.</p>
          </Link>

          <Link
            href="/admin/user-photos"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-amber-200 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 mb-4">
              <span className="material-symbols-outlined text-amber-600 text-base">photo_library</span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Photo Moderation
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">Review guest-submitted photos.</p>
          </Link>

          <Link
            href="/"
            className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-gray-200 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 mb-4">
              <span className="material-symbols-outlined text-[#5B6472] text-base">
                arrow_back
              </span>
            </div>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">
              Back to Site
            </h2>
            <p className="mt-1 text-xs text-[#5B6472]">
              Return to Pearlora.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
