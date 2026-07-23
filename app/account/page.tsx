import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { roleLabel } from "@/lib/roles";
import { Badge, Card, StatCard, buttonVariants } from "@/components/ui";
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
    <main className="page-gradient min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Profile header */}
        <Card className="overflow-hidden">
          <div className="admin-header-gradient h-2" />
          <div className="p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#14213d] font-(family-name:--font-playfair-display) text-xl font-bold text-white ring-2 ring-[#d9a94d]/40">
                {initials}
              </div>
              <div>
                <h1 className="font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
                  {currentUser.name || "Guest"}
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {currentUser.email}
                </p>
                <Badge tone="navy" className="mt-2">
                  {roleLabel(currentUser.role)}
                </Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon="event_available"
                label="Total Bookings"
                value={totalBookings}
                tone="blue"
              />
              <StatCard
                icon="check_circle"
                label="Active"
                value={activeBookings}
                tone="emerald"
              />
              <StatCard
                icon="cancel"
                label="Cancelled"
                value={cancelledBookings}
                tone="rose"
              />
              <StatCard
                icon="payments"
                label="Total Spent"
                value={`LKR ${totalSpent.toLocaleString()}`}
                tone="invert"
              />
            </div>

            {/* Profile details */}
            <div className="mt-8 grid gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Name
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {currentUser.name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Email
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {currentUser.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Member Since
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {currentUser.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Account ID
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-500">
                  {currentUser.id}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/bookings" className={buttonVariants({ variant: "primary" })}>
                View My Bookings
              </Link>
              <Link href="/" className={buttonVariants({ variant: "outline" })}>
                Back to Home
              </Link>
            </div>
          </div>
        </Card>

        <EditProfileForm initialName={currentUser.name || ""} />
        <ChangePasswordForm />
      </div>
    </main>
  );
}
