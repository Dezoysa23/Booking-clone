import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-600 border border-rose-100",
  PENDING: "bg-[#f4ecd8] text-[#14213d] border border-[#14213d]/10",
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

  if (!isSuperAdmin(currentUser)) {
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
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link
                href="/admin"
                className="text-xs text-slate-400 hover:text-[#14213d] transition-colors"
              >
                Admin
              </Link>
              <span className="text-slate-300 text-xs">›</span>
              <span className="text-xs text-[#14213d] font-medium">
                All Bookings
              </span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              All Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
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
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Summary stats */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/50">
              Shown
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#14213d]">
              {bookings.length}
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#14213d]/50">
              Pending
            </p>
            <p className="mt-1.5 text-2xl font-bold text-[#14213d]">
              {bookings.filter((b) => b.status === "PENDING").length}
            </p>
          </div>
          <div className="rounded-2xl bg-[#14213d] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d9a94d]">
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
          className="mb-6 rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-35">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              name="status"
              defaultValue={filterStatus}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#14213d] focus:bg-white focus:ring-2 focus:ring-[#14213d]/10"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex-1 min-w-40">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Property
            </label>
            <select
              name="propertyId"
              defaultValue={filterPropertyId?.toString() || ""}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#14213d] focus:bg-white focus:ring-2 focus:ring-[#14213d]/10"
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
              className="rounded-lg bg-[#14213d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
            >
              Filter
            </button>
            <Link
              href="/admin/bookings"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* Bookings table */}
        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[#14213d]/30 text-xl">
                calendar_month
              </span>
            </div>
            <h3 className="font-(family-name:--font-playfair-display) text-lg font-semibold text-[#14213d]">
              No bookings found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {filterStatus || filterPropertyId
                ? "Try adjusting your filters."
                : "Bookings will appear here once guests reserve properties."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white border border-[#e7ddc9] shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      ID
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Guest
                    </th>
                    <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Property
                    </th>
                    <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Check-in
                    </th>
                    <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Check-out
                    </th>
                    <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Nights
                    </th>
                    <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Total
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                        #{booking.id}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-[#14213d] text-sm">
                            {booking.user?.name || "Guest"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-40">
                            {booking.user?.email || "—"}
                          </p>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-5 py-4">
                        <div>
                          <p className="text-sm text-slate-700 font-medium">
                            {booking.property.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {booking.property.location}
                          </p>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">
                        {booking.checkIn.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">
                        {booking.checkOut.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-600">
                        {booking.nights}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-4 text-sm font-semibold text-[#14213d]">
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
