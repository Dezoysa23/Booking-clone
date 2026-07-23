import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";
import EditProfileForm from "@/components/EditProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const bookings = await prisma.booking
    .findMany({ where: { userId: currentUser.id } })
    .catch((error) => {
      console.error("[Account] Failed to fetch bookings:", error);
      return [];
    });

  const totalBookings  = bookings.length;
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED").length;
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;
  const totalSpent     = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const initials = currentUser.name
    ? currentUser.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : currentUser.email.slice(0, 2).toUpperCase();

  const STATS = [
    { label: "Total Bookings", value: totalBookings,    color: "text-[#0f1f3d]", bg: "bg-[#faf8f5]", accent: "text-[#0f1f3d]/50" },
    { label: "Active",         value: activeBookings,   color: "text-emerald-700", bg: "bg-emerald-50",  accent: "text-emerald-600/60" },
    { label: "Cancelled",      value: cancelledBookings,color: "text-red-600",    bg: "bg-red-50",      accent: "text-red-500/60" },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Profile header card */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Decorative top band */}
          <div className="h-1.5 bg-gradient-to-r from-[#071B63] via-[#123EAF] to-[#1D63D8]" />

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Avatar */}
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white text-xl font-bold font-[family-name:var(--font-playfair-display)] shadow-md"
                style={{ background: "linear-gradient(135deg, #071B63 0%, #123EAF 100%)" }}
              >
                {initials}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d]">
                      {currentUser.name || "Guest"}
                    </h1>
                    <p className="mt-0.5 text-sm text-gray-500">{currentUser.email}</p>
                  </div>
                  <span className="rounded-full border border-[#071B63]/15 bg-[#071B63]/6 px-3 py-1 text-xs font-semibold text-[#071B63] tracking-wide">
                    {roleLabel(currentUser.role)}
                  </span>
                </div>

                {/* Profile details row */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2 rounded-xl bg-[#faf8f5] border border-gray-100 p-5">
                  {[
                    { label: "Full Name",     value: currentUser.name || "Not provided" },
                    { label: "Email Address", value: currentUser.email },
                    {
                      label: "Member Since",
                      value: currentUser.createdAt.toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric",
                      }),
                    },
                    { label: "Account ID",    value: currentUser.id, mono: true, truncate: true },
                  ].map(({ label, value, mono, truncate }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">{label}</p>
                      <p className={`mt-1 font-medium text-gray-900 text-sm ${mono ? "font-mono text-xs text-gray-500" : ""} ${truncate ? "truncate" : ""}`}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {STATS.map(({ label, value, color, bg, accent }) => (
                <div key={label} className={`rounded-xl ${bg} border border-gray-100 p-4`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${accent}`}>{label}</p>
                  <p className={`mt-1.5 text-3xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
              {/* Total Spent — dark card */}
              <div className="rounded-xl bg-[#0f1f3d] border border-[#0f1f3d] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#D8B45A]">Total Spent</p>
                <p className="mt-1.5 text-xl font-bold text-white">LKR {totalSpent.toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="rounded-xl bg-[#0f1f3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">luggage</span>
                View My Bookings
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071B63]/8">
              <span className="material-symbols-outlined text-[#071B63] text-lg">manage_accounts</span>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
                Edit Profile
              </h2>
              <p className="text-xs text-gray-400">Update your display name</p>
            </div>
          </div>
          <div className="p-8">
            <EditProfileForm initialName={currentUser.name || ""} />
          </div>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D8B45A]/12">
              <span className="material-symbols-outlined text-[#B8860B] text-lg">lock_reset</span>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
                Change Password
              </h2>
              <p className="text-xs text-gray-400">Keep your account secure</p>
            </div>
          </div>
          <div className="p-8">
            <ChangePasswordForm />
          </div>
        </div>

      </div>
    </main>
  );
}
