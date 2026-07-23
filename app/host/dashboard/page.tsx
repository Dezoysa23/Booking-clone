import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscription } from "@/lib/subscription";
import { Card, StatCard, buttonVariants } from "@/components/ui";

export default async function HostDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [subscription, propertyCount, bookingCount, revenueResult] =
    await Promise.all([
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

  const actions = [
    {
      href: "/host/properties",
      icon: "apartment",
      chip: "bg-[#14213d] text-white",
      title: "My Properties",
      description: "Manage your listings.",
    },
    {
      href: "/host/properties/new",
      icon: "add_circle",
      chip: "bg-[#d9a94d] text-white",
      title: "Add Property",
      description: "Create a new listing.",
    },
    {
      href: "/host/billing",
      icon: "receipt_long",
      chip: "bg-[#f4ecd8] text-[#14213d]",
      title: "Billing",
      description: "Subscription and payments.",
    },
  ];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="font-(family-name:--font-playfair-display) text-2xl md:text-3xl font-semibold text-[#14213d]">
          Welcome back
          {currentUser.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isActive
            ? `You're on the ${subscription!.plan.name} plan.`
            : "Subscribe to start listing your properties."}
        </p>
      </div>

      {/* Subscription status banner */}
      {!isActive && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#14213d] px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-white">
              No active subscription
            </p>
            <p className="mt-0.5 text-xs text-white/60">
              Subscribe to list properties and start earning.
            </p>
          </div>
          <Link
            href="/pricing"
            className={buttonVariants({ variant: "accent", size: "sm" })}
          >
            View Plans
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon="apartment"
          label="Properties"
          value={propertyCount}
          hint={
            isActive && propertyLimit !== -1
              ? `of ${propertyLimit} allowed`
              : undefined
          }
          tone="blue"
        />
        <StatCard
          icon="event_available"
          label="Bookings"
          value={bookingCount}
          hint="All time"
          tone="emerald"
        />
        <StatCard
          icon="payments"
          label="Revenue"
          value={`LKR ${totalRevenue.toLocaleString()}`}
          hint="Confirmed bookings"
          tone="invert"
        />
      </div>

      {/* Quick actions */}
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
        Quick Actions
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <Card hover className="h-full p-6">
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${action.chip}`}
              >
                <span className="material-symbols-outlined text-xl leading-none">
                  {action.icon}
                </span>
              </div>
              <h3 className="font-(family-name:--font-playfair-display) text-base font-semibold text-[#14213d]">
                {action.title}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{action.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
