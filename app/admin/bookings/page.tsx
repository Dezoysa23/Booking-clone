import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700 border border-green-100",
  CANCELLED: "bg-red-50 text-red-600 border border-red-100",
  PENDING: "bg-[#eef2fa] text-[#071B63] border border-[#071B63]/10",
};

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  PENDING: "Pending",
};

type Props = {
  searchParams: Promise<{ status?: string; propertyId?: string }>;
};

export default async function AdminBookingsPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const VALID_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
  type ValidStatus = (typeof VALID_STATUSES)[number];
  const rawStatus = params.status || "";
  const filterStatus = (VALID_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as ValidStatus)
    : "";
  const filterPropertyId = params.propertyId ? Number(params.propertyId) : undefined;

  const bookings = await prisma.booking.findMany({
    where: {
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(filterPropertyId && !Number.isNaN(filterPropertyId) ? { propertyId: filterPropertyId } : {}),
    },
    include: {
      property: { select: { id: true, name: true, location: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const properties = await prisma.property.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const totalRevenue = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link
                href="/admin"
                className="text-xs text-gray-400 hover:text-[#0f1f3d] transition-colors"
              >
                Admin
              </Link>
              <span className="text-gray-300 text-xs">›</span>
              <span className="text-xs text-[#0f1f3d] font-medium">
                All Bookings
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              All Bookings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {bookings.length}{" "}
              {bookings.length === 1 ? "booking" : "bookings"}
              {filterStatus && (
                <span>
                  {" "}
                  ·{" "}
                  <span className="font-medium">
                    {STATUS_LABELS[filterStatus] ?? filterStatus}
                  </span>
                </span>
              )}
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/50">
              Shown
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#0f1f3d]">
              {bookings.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/50">
              Pending
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#0f1f3d]">
              {bookings.filter((b) => b.status === "PENDING").length}
            </p>
          </div>
          <div className="rounded-2xl bg-[#071B63] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D8B45A]">
              Revenue
            </p>
            <p className="mt-1.5 text-xl font-bold text-white">
              LKR {totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <form
          method="GET"
          action="/admin/bookings"
          className="mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
              Status
            </label>
            <select
              name="status"
              defaultValue={filterStatus}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400">
              Property
            </label>
            <select
              name="propertyId"
              defaultValue={filterPropertyId?.toString() || ""}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10"
            >
              <option value="">All properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-[#071B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
            >
              Filter
            </button>
            <Link
              href="/admin/bookings"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* Bookings table */}
        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-gray-100">
              <span className="material-symbols-outlined text-[#0f1f3d]/30 text-xl">
                calendar_month
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
              No bookings found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filterStatus || filterPropertyId
                ? "Try adjusting your filters."
                : "Bookings will appear here once guests reserve properties."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 bg-[#faf8f5]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      ID
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Guest
                    </th>
                    <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Property
                    </th>
                    <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Check-in
                    </th>
                    <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Check-out
                    </th>
                    <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Nights
                    </th>
                    <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Total
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-[#faf8f5] transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                        #{booking.id}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-[#0f1f3d] text-sm">
                            {booking.user?.name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                            {booking.user?.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-5 py-4">
                        <div>
                          <p className="text-sm text-gray-700 font-medium">
                            {booking.property.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {booking.property.location}
                          </p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-600">
                        {booking.checkIn.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-600">
                        {booking.checkOut.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-600">
                        {booking.nights}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-4 text-sm font-semibold text-[#0f1f3d]">
                        LKR {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
                            STATUS_STYLES[booking.status] ?? STATUS_STYLES.PENDING
                          }`}
                        >
                          {STATUS_LABELS[booking.status] ?? booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
