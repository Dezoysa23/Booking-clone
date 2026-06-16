import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveSubscription } from "@/lib/subscription";
import DeletePropertyButton from "@/components/DeletePropertyButton";

export default async function HostPropertiesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [properties, subscription] = await Promise.all([
    prisma.property.findMany({
      where: { hostId: currentUser.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    }),
    getActiveSubscription(currentUser.id),
  ]);

  const propertyLimit = subscription?.plan.propertyLimit ?? 0;
  const canAdd = subscription && (propertyLimit === -1 || properties.length < propertyLimit);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
            My Properties
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {properties.length} listing{properties.length !== 1 ? "s" : ""}
            {subscription && propertyLimit !== -1 && ` · ${propertyLimit - properties.length} slots remaining`}
          </p>
        </div>
        {canAdd ? (
          <Link
            href="/host/properties/new"
            className="rounded-lg bg-[#071B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
          >
            Add Property
          </Link>
        ) : !subscription ? (
          <Link
            href="/pricing"
            className="rounded-lg bg-[#D8B45A] px-5 py-2.5 text-sm font-semibold text-[#071B63] hover:bg-[#c9a84c] transition-colors"
          >
            Subscribe to List
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="rounded-lg border border-[#D8B45A]/40 bg-white px-5 py-2.5 text-sm font-medium text-[#8a6c2a] hover:bg-[#fdf8ee] transition-colors"
          >
            Upgrade Plan
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-gray-100">
            <span className="material-symbols-outlined text-[#0f1f3d]/30 text-xl">apartment</span>
          </div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
            No properties yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {subscription ? "Add your first property to get started." : "Subscribe to a plan to start listing."}
          </p>
          {subscription && (
            <Link href="/host/properties/new" className="mt-5 inline-block rounded-lg bg-[#0f1f3d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors">
              Add First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-[#faf8f5]">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Property</th>
                <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Location</th>
                <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Price/night</th>
                <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Bookings</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={property.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-semibold text-[#0f1f3d] text-sm">{property.name}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 text-sm text-gray-500">{property.location}</td>
                  <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-600">LKR {property.price.toLocaleString()}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-500">{property._count.bookings}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2 flex-wrap">
                      <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg border border-[#071B63]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#071B63] hover:bg-[#071B63]/5 transition-colors">
                        View
                      </Link>
                      <Link href={`/host/properties/${property.id}`}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit
                      </Link>
                      <Link href={`/host/properties/${property.id}/availability`}
                        className="rounded-lg border border-[#D8B45A]/40 bg-white px-3 py-1.5 text-xs font-medium text-[#8a6c2a] hover:bg-[#fdf8ee] transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">calendar_month</span>
                        Availability
                      </Link>
                      <DeletePropertyButton
                        propertyId={property.id}
                        propertyName={property.name}
                        apiBase="/api/host/properties"
                        redirectPath="/host/properties"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
