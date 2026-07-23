import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";
import DeletePropertyButton from "@/components/DeletePropertyButton";

type Props = {
  searchParams: Promise<{ success?: string }>;
};

export default async function AdminPropertiesPage({ searchParams }: Props) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isSuperAdmin(currentUser)) {
    redirect("/");
  }

  const params = await searchParams;
  const success = params.success;

  const properties = await prisma.property.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
      location: true,
      price: true,
      rating: true,
      image: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
                Properties
              </span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              Manage Properties
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} listed
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/properties/new"
              className="rounded-lg bg-[#14213d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
            >
              Add Property
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Success banner */}
        {(success === "created" || success === "updated") && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-5 py-4">
            <span className="material-symbols-outlined text-emerald-600 text-lg">
              check_circle
            </span>
            <p className="text-sm font-medium text-emerald-800">
              {success === "created"
                ? "Property created successfully."
                : "Property updated successfully."}
            </p>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
              <span className="material-symbols-outlined text-[#14213d]/30 text-xl">
                apartment
              </span>
            </div>
            <h3 className="font-(family-name:--font-playfair-display) text-lg font-semibold text-[#14213d]">
              No properties yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Add the first property to get started.
            </p>
            <Link
              href="/admin/properties/new"
              className="mt-5 inline-block rounded-lg bg-[#14213d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#14213d] transition-colors"
            >
              Add First Property
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white border border-[#e7ddc9] shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    ID
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Property
                  </th>
                  <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Location
                  </th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Price / night
                  </th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Rating
                  </th>
                  <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Bookings
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">
                      #{property.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={property.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[#14213d] text-sm">
                          {property.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-5 py-4 text-sm text-slate-500">
                      {property.location}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">
                      LKR {property.price.toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#14213d] px-2.5 py-1 text-xs font-bold text-white">
                        <span className="material-symbols-outlined text-[#d9a94d] text-xs filled">
                          star
                        </span>
                        {property.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-500">
                      {property._count.bookings}{" "}
                      {property._count.bookings === 1 ? "booking" : "bookings"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2 flex-wrap">
                        <Link
                          href={`/properties/${property.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#14213d]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#14213d] hover:bg-[#14213d]/5 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}`}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <DeletePropertyButton
                          propertyId={property.id}
                          propertyName={property.name}
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
    </main>
  );
}
