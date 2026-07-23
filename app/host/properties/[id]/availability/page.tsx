import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isHostOrAdmin, isSuperAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import AvailabilityCalendar from "./AvailabilityCalendar";

type Props = { params: Promise<{ id: string }> };

export default async function PropertyAvailabilityPage({ params }: Props) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isHostOrAdmin(currentUser)) redirect("/pricing");

  const { id } = await params;
  const propertyId = Number(id);
  if (Number.isNaN(propertyId)) notFound();

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, name: true, hostId: true },
  });

  if (!property) notFound();

  // Hosts can only access their own property; super admins can access all
  if (!isSuperAdmin(currentUser) && property.hostId !== currentUser.id) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6 text-xs text-gray-400 flex-wrap">
        <Link href="/host/dashboard" className="hover:text-[#14213D] transition-colors">Dashboard</Link>
        <span className="text-gray-300">›</span>
        <Link href="/host/properties" className="hover:text-[#14213D] transition-colors">Properties</Link>
        <span className="text-gray-300">›</span>
        <Link href={`/host/properties/${property.id}`} className="hover:text-[#14213D] transition-colors truncate max-w-[140px]">
          {property.name}
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-[#14213D] font-medium">Availability</span>
      </div>

      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-2xl font-semibold text-[#14213D]">
              Room Availability
            </h1>
            <p className="mt-1 text-sm text-gray-500">{property.name}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/properties/${property.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">open_in_new</span>
              View listing
            </Link>
            <Link
              href={`/host/properties/${property.id}`}
              className="flex items-center gap-1.5 rounded-lg border border-[#14213D]/20 bg-white px-4 py-2 text-xs font-medium text-[#14213D] hover:bg-[#14213D]/5 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              Edit property
            </Link>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
          <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">info</span>
          <p className="text-xs text-blue-700 leading-relaxed">
            Use this page to block dates for maintenance, personal use, or other reasons.
            Confirmed bookings appear on the calendar but <strong>cannot be modified here</strong> — manage bookings from the Bookings section.
            Blocked dates prevent guest bookings automatically.
          </p>
        </div>
      </div>

      <AvailabilityCalendar propertyId={property.id} />
    </div>
  );
}
