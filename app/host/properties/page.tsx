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
          <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
            My Properties
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {properties.length} listing{properties.length !== 1 ? "s" : ""}
            {subscription && propertyLimit !== -1 && ` · ${propertyLimit - properties.length} slots remaining`}
          </p>
        </div>
        {canAdd ? (
          <Link
            href="/host/properties/new"
            className="rounded-lg bg-[#14213d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
          >
            Add Property
          </Link>
        ) : !subscription ? (
          <Link
            href="/pricing"
            className="rounded-lg bg-[#d9a94d] px-5 py-2.5 text-sm font-semibold text-[#14213d] hover:bg-[#c4922f] transition-colors"
          >
            Subscribe to List
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="rounded-lg border border-[#d9a94d]/40 bg-white px-5 py-2.5 text-sm font-medium text-on-primary-fixed-variant hover:bg-[#f4ecd8] transition-colors"
          >
            Upgrade Plan
          </Link>
        )}
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/70 shadow-sm p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 border border-slate-200/70">
            <span className="material-symbols-outlined text-[#14213d]/30 text-xl">apartment</span>
          </div>
          <h3 className="font-(family-name:--font-playfair-display) text-lg font-semibold text-[#14213d]">
            No properties yet
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {subscription ? "Add your first property to get started." : "Subscribe to a plan to start listing."}
          </p>
          {subscription && (
            <Link href="/host/properties/new" className="mt-5 inline-block rounded-lg bg-[#14213d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors">
              Add First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white border border-[#e7ddc9] shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/70 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Property</th>
                <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Location</th>
                <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Price/night</th>
                <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Bookings</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={property.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <span className="font-semibold text-[#14213d] text-sm">{property.name}</span>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 text-sm text-slate-500">{property.location}</td>
                  <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">LKR {property.price.toLocaleString()}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-500">{property._count.bookings}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2 flex-wrap">
                      <Link href={`/properties/${property.id}`} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg border border-[#14213d]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#14213d] hover:bg-[#14213d]/5 transition-colors">
                        View
                      </Link>
                      <Link href={`/host/properties/${property.id}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Edit
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
