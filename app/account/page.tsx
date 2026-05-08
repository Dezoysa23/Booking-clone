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

  const bookings = await prisma.booking.findMany({
    where: {
      userId: currentUser.id,
    },
  });

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(
    (booking) => booking.status !== "CANCELLED"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  ).length;
  const totalSpent = bookings
    .filter((booking) => booking.status !== "CANCELLED")
    .reduce((sum, booking) => sum + booking.totalPrice, 0);

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-4xl font-bold text-gray-900">My Account</h1>

          <p className="mt-3 text-gray-600">
            Manage your profile and view your account information.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-blue-50 p-5">
              <p className="text-sm text-blue-700">Total Bookings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {totalBookings}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-5">
              <p className="text-sm text-green-700">Active Bookings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {activeBookings}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-5">
              <p className="text-sm text-red-700">Cancelled Bookings</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {cancelledBookings}
              </p>
            </div>

            <div className="rounded-xl bg-yellow-50 p-5">
              <p className="text-sm text-yellow-700">Total Spent</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                LKR {totalSpent.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6 rounded-xl bg-gray-50 p-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.name || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.role}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Account ID</p>
              <p className="break-all text-sm font-medium text-gray-700">
                {currentUser.id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {currentUser.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/bookings"
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              View My Bookings
            </Link>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>

             <EditProfileForm initialName={currentUser.name || ""} />

        <ChangePasswordForm />
      </div>
    </main>
  );
}