import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscription } from "@/lib/subscription";

export default async function HostDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [subscription, propertyCount, bookingCount, revenueResult] = await Promise.all([
    getSubscription(currentUser.id),
    prisma.property.count({ where: { hostId: currentUser.id } }),
    prisma.booking.count({
      where: { property: { hostId: currentUser.id } },
    }),
    prisma.booking.aggregate({
      where: { property: { hostId: currentUser.id }, status: "CONFIRMED" },
      _sum: { totalPrice: true },
    }),
  ]);

  const totalRevenue = revenueResult._sum.totalPrice ?? 0;
  const isActive = subscription?.status === "ACTIVE";
  const propertyLimit = subscription?.plan.propertyLimit ?? 0;

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-8 bg-[#D9A94D]" />
          <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#D9A94D]">Host Portal</span>
        </div>
        <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
          Welcome back{currentUser.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-[#5B6472]">
          {isActive
            ? `You're on the ${subscription!.plan.name} plan.`
            : "Subscribe to start listing your properties."}
        </p>
      </div>

      {/* Subscription status banner */}
      {!isActive && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-[#14213D] px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-white">No active subscription</p>
            <p className="mt-0.5 text-xs text-white/60">Subscribe to list properties and start earning.</p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-[#D9A94D] px-5 py-2.5 text-xs font-semibold text-[#14213D] hover:bg-[#c99a3f] transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/50">Properties</p>
          <p className="mt-2 text-3xl font-bold text-[#14213D]">{propertyCount}</p>
          {isActive && propertyLimit !== -1 && (
            <p className="mt-1 text-xs text-[#7C879B]">of {propertyLimit} allowed</p>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/50">Bookings</p>
          <p className="mt-2 text-3xl font-bold text-[#14213D]">{bookingCount}</p>
          <p className="mt-1 text-xs text-[#7C879B]">All time</p>
        </div>
        <div className="rounded-2xl bg-[#14213D] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D9A94D]">Revenue</p>
          <p className="mt-2 text-xl font-bold text-white">LKR {totalRevenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-white/40">Confirmed bookings</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#14213D]/40 mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/host/properties" className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#14213D]/20 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D] mb-4">
            <span className="material-symbols-outlined text-white text-base">apartment</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">My Properties</h3>
          <p className="mt-1 text-xs text-[#5B6472]">Manage your listings.</p>
        </Link>

        <Link href="/host/properties/new" className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#D9A94D]/40 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9A94D] mb-4">
            <span className="material-symbols-outlined text-[#14213D] text-base">add_circle</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">Add Property</h3>
          <p className="mt-1 text-xs text-[#5B6472]">Create a new listing.</p>
        </Link>

        <Link href="/host/billing" className="group rounded-2xl bg-white border border-gray-100 shadow-[0_2px_12px_rgba(20,33,61,0.05)] p-6 hover:shadow-[0_18px_44px_-14px_rgba(20,33,61,0.18)] hover:-translate-y-1 hover:border-[#14213D]/20 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213D]/8 mb-4">
            <span className="material-symbols-outlined text-[#14213D] text-base">receipt_long</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#14213D]">Billing</h3>
          <p className="mt-1 text-xs text-[#5B6472]">Subscription and payments.</p>
        </Link>
      </div>
    </div>
  );
}
