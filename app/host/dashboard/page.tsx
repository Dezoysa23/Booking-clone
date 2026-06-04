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
        <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
          Welcome back{currentUser.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isActive
            ? `You're on the ${subscription!.plan.name} plan.`
            : "Subscribe to start listing your properties."}
        </p>
      </div>

      {/* Subscription status banner */}
      {!isActive && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-[#071B63] px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-white">No active subscription</p>
            <p className="mt-0.5 text-xs text-white/60">Subscribe to list properties and start earning.</p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 rounded-lg bg-[#D8B45A] px-5 py-2.5 text-xs font-semibold text-[#071B63] hover:bg-[#c9a84c] transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/50">Properties</p>
          <p className="mt-2 text-3xl font-bold text-[#0f1f3d]">{propertyCount}</p>
          {isActive && propertyLimit !== -1 && (
            <p className="mt-1 text-xs text-gray-400">of {propertyLimit} allowed</p>
          )}
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/50">Bookings</p>
          <p className="mt-2 text-3xl font-bold text-[#0f1f3d]">{bookingCount}</p>
          <p className="mt-1 text-xs text-gray-400">All time</p>
        </div>
        <div className="rounded-2xl bg-[#071B63] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D8B45A]">Revenue</p>
          <p className="mt-2 text-xl font-bold text-white">LKR {totalRevenue.toLocaleString()}</p>
          <p className="mt-1 text-xs text-white/40">Confirmed bookings</p>
        </div>
      </div>

      {/* Quick actions */}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/40 mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/host/properties" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#071B63]/20 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071B63] mb-4">
            <span className="material-symbols-outlined text-white text-base">apartment</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">My Properties</h3>
          <p className="mt-1 text-xs text-gray-500">Manage your listings.</p>
        </Link>

        <Link href="/host/properties/new" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#D8B45A]/40 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D8B45A] mb-4">
            <span className="material-symbols-outlined text-[#071B63] text-base">add_circle</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">Add Property</h3>
          <p className="mt-1 text-xs text-gray-500">Create a new listing.</p>
        </Link>

        <Link href="/host/billing" className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-[#071B63]/20 transition-all">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071B63]/8 mb-4">
            <span className="material-symbols-outlined text-[#071B63] text-base">receipt_long</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-base font-semibold text-[#0f1f3d]">Billing</h3>
          <p className="mt-1 text-xs text-gray-500">Subscription and payments.</p>
        </Link>
      </div>
    </div>
  );
}
