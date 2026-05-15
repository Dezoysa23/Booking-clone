import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
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

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status !== "CANCELLED").length;
  const cancelledBookings = bookings.filter((b) => b.status === "CANCELLED").length;
  const totalSpent = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const initials = currentUser.name
    ? currentUser.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : currentUser.email.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* Profile header */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-2 bg-[#0f1f3d]" />
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#0f1f3d] text-white text-xl font-bold font-[family-name:var(--font-playfair-display)]">
                {initials}
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#0f1f3d]">
                  {currentUser.name || "Guest"}
                </h1>
                <p className="mt-0.5 text-sm text-gray-500">{currentUser.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-[#0f1f3d]/8 px-3 py-0.5 text-xs font-semibold text-[#0f1f3d] tracking-wide">
                  {currentUser.role === "ADMIN" ? "Administrator" : "Member"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-[#faf8f5] border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#0f1f3d]/50">Total Bookings</p>
                <p className="mt-2 text-3xl font-bold text-[#0f1f3d]">{totalBookings}</p>
              </div>
              <div className="rounded-xl bg-[#faf8f5] border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-green-600/70">Active</p>
                <p className="mt-2 text-3xl font-bold text-[#0f1f3d]">{activeBookings}</p>
              </div>
              <div className="rounded-xl bg-[#faf8f5] border border-gray-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-red-500/70">Cancelled</p>
                <p className="mt-2 text-3xl font-bold text-[#0f1f3d]">{cancelledBookings}</p>
              </div>
              <div className="rounded-xl bg-[#0f1f3d] p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a84c]">Total Spent</p>
                <p className="mt-2 text-2xl font-bold text-white">
                  LKR {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Profile details */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 rounded-xl bg-[#faf8f5] border border-gray-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Name</p>
                <p className="mt-1 font-medium text-gray-900">{currentUser.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Email</p>
                <p className="mt-1 font-medium text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Member Since</p>
                <p className="mt-1 font-medium text-gray-900">
                  {currentUser.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Account ID</p>
                <p className="mt-1 break-all text-xs text-gray-500 font-mono">{currentUser.id}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/bookings"
                className="rounded-lg bg-[#0f1f3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <EditProfileForm initialName={currentUser.name || ""} />
        <ChangePasswordForm />
      </div>
    </main>
  );
}
