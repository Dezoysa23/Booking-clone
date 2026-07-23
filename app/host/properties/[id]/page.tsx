import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";
import PropertyForm from "@/components/PropertyForm";

type Props = { params: Promise<{ id: string }> };

export default async function HostEditPropertyPage({ params }: Props) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const { id } = await params;
  const propertyId = Number(id);
  if (Number.isNaN(propertyId)) notFound();

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, name: true, location: true, price: true, rating: true, image: true, description: true, amenities: true, gallery: true, maxGuests: true, facilities: true, houseRules: true, areaInfo: true, hostId: true },
  });

  if (!property) notFound();
  if (!isSuperAdmin(currentUser) && property.hostId !== currentUser.id) notFound();

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-6 text-xs text-gray-400">
        <Link href="/host/dashboard" className="hover:text-[#14213D] transition-colors">Dashboard</Link>
        <span className="text-gray-300">›</span>
        <Link href="/host/properties" className="hover:text-[#14213D] transition-colors">Properties</Link>
        <span className="text-gray-300">›</span>
        <span className="text-[#14213D] font-medium">Edit #{property.id}</span>
      </div>
      <div className="max-w-4xl">
        <PropertyForm
          mode="edit"
          initialValues={property}
          apiBase="/api/host/properties"
          cancelPath="/host/properties"
          successPath="/host/properties"
        />
      </div>
    </div>
  );
}
