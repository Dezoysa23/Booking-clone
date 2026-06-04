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
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
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
                Properties
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              Manage Properties
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"} listed
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/properties/new"
              className="rounded-lg bg-[#071B63] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
            >
              Add Property
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Success banner */}
        {(success === "created" || success === "updated") && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-100 px-5 py-4">
            <span className="material-symbols-outlined text-green-600 text-lg">
              check_circle
            </span>
            <p className="text-sm font-medium text-green-800">
              {success === "created"
                ? "Property created successfully."
                : "Property updated successfully."}
            </p>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-gray-100">
              <span className="material-symbols-outlined text-[#0f1f3d]/30 text-xl">
                apartment
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
              No properties yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add the first property to get started.
            </p>
            <Link
              href="/admin/properties/new"
              className="mt-5 inline-block rounded-lg bg-[#0f1f3d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a3060] transition-colors"
            >
              Add First Property
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#faf8f5]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    ID
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Property
                  </th>
                  <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Location
                  </th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Price / night
                  </th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Rating
                  </th>
                  <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Bookings
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-[#faf8f5] transition-colors"
                  >
                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                      #{property.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={property.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[#0f1f3d] text-sm">
                          {property.name}
                        </span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-5 py-4 text-sm text-gray-500">
                      {property.location}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-600">
                      LKR {property.price.toLocaleString()}
                    </td>
                    <td className="hidden sm:table-cell px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#071B63] px-2.5 py-1 text-xs font-bold text-white">
                        <span className="material-symbols-outlined text-[#D8B45A] text-xs filled">
                          star
                        </span>
                        {property.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-500">
                      {property._count.bookings}{" "}
                      {property._count.bookings === 1 ? "booking" : "bookings"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2 flex-wrap">
                        <Link
                          href={`/properties/${property.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-[#071B63]/20 bg-white px-3 py-1.5 text-xs font-medium text-[#071B63] hover:bg-[#071B63]/5 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}`}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
