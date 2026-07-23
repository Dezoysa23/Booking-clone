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
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="rounded-2xl admin-header-gradient px-5 py-6 md:px-8 md:py-8 mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <Image
              src="/brand/Pearlora-logo-only.png"
              alt="Pearlora"
              width={28}
              height={28}
              className="rounded object-contain shrink-0"
            />
            <span className="text-[#d9a94d] text-xs font-semibold tracking-widest uppercase">
              Pearlora Admin
            </span>
          </div>
          <h1 className="font-(family-name:--font-playfair-display) text-2xl md:text-3xl font-semibold text-white">
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
          <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/50">
                Properties
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213d]/8">
                <span className="material-symbols-outlined text-[#14213d] text-sm">
                  apartment
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213d]">{propertyCount}</p>
              {avgRating !== null && propertyCount > 0 ? (
                <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#d9a94d] filled text-xs">star</span>
                  Avg {avgRating.toFixed(1)} rating
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">Listed on Pearlora</p>
              )}
            </div>
          </div>

          {/* Registered users */}
          <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/50">
                Users
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D63D8]/8">
                <span className="material-symbols-outlined text-[#1D63D8] text-sm">
                  group
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213d]">{userCount}</p>
              <p className="mt-1 text-xs text-slate-400">Registered accounts</p>
            </div>
          </div>

          {/* Total bookings */}
          <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/50">
                Total Bookings
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14213d]/8">
                <span className="material-symbols-outlined text-[#14213d] text-sm">
                  calendar_month
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#14213d]">{bookingCount}</p>
              <p className="mt-1 text-xs text-slate-400">All time</p>
            </div>
          </div>

          {/* Active (confirmed) bookings */}
          <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/60">
                Active
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                <span className="material-symbols-outlined text-emerald-600 text-sm">
                  check_circle
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">{confirmedCount}</p>
              <p className="mt-1 text-xs text-emerald-600/60">Confirmed</p>
            </div>
          </div>

          {/* Pending bookings */}
          <div className="rounded-2xl bg-[#14213d] p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
                Pending
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <span className="material-symbols-outlined text-[#d9a94d] text-sm">
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
          <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-400/80">
                Cancelled
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                <span className="material-symbols-outlined text-rose-400 text-sm">
                  cancel
                </span>
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-rose-500">{cancelledCount}</p>
              <p className="mt-1 text-xs text-rose-400/60">Cancelled bookings</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Action cards */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/40 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link
            href="/admin/properties"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#14213d]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] mb-4">
              <span className="material-symbols-outlined text-white text-base">
                apartment
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Manage Properties
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View, edit, and delete listings.
            </p>
          </Link>

          <Link
            href="/admin/properties/new"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#d9a94d]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a94d] mb-4">
              <span className="material-symbols-outlined text-[#14213d] text-base">
                add_circle
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Add Property
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Create a new listing.
            </p>
          </Link>

          <Link
            href="/admin/bookings"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#14213d]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d]/8 mb-4">
              <span className="material-symbols-outlined text-[#14213d] text-base">
                calendar_month
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              All Bookings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View and manage reservations.
            </p>
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#14213d]/20 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d]/8 mb-4">
              <span className="material-symbols-outlined text-[#14213d] text-base">
                group
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Users
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View all registered accounts.
            </p>
          </Link>

          <Link
            href="/admin/subscriptions"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#d9a94d]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a94d]/15 mb-4">
              <span className="material-symbols-outlined text-on-primary-fixed-variant text-base">
                workspace_premium
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Subscriptions
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Host plan subscriptions.
            </p>
          </Link>

          <Link
            href="/admin/payments"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-emerald-200 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-base">
                payments
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Payments
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Billing and revenue history.
            </p>
          </Link>

          <Link
            href="/admin/calendar"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#d9a94d]/40 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9a94d]/10 mb-4">
              <span className="material-symbols-outlined text-[#B8860B] text-base">calendar_month</span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Platform Calendar
            </h2>
            <p className="mt-1 text-xs text-slate-500">Bookings, payments &amp; events.</p>
          </Link>

          <Link
            href="/admin/user-photos"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-[#e8c892] transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4ecd8] mb-4">
              <span className="material-symbols-outlined text-[#c4922f] text-base">photo_library</span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Photo Moderation
            </h2>
            <p className="mt-1 text-xs text-slate-500">Review guest-submitted photos.</p>
          </Link>

          <Link
            href="/"
            className="group rounded-2xl bg-white border border-slate-200/70 shadow-sm p-6 hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 mb-4">
              <span className="material-symbols-outlined text-slate-500 text-base">
                arrow_back
              </span>
            </div>
            <h2 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
              Back to Site
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Return to Pearlora.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
