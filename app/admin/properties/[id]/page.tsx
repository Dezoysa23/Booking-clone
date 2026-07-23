import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";
import EditPropertyForm from "@/components/EditPropertyForm";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isSuperAdmin(currentUser)) {
    redirect("/");
  }

  const { id } = await params;
  const propertyId = Number(id);

  if (Number.isNaN(propertyId)) {
    notFound();
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      name: true,
      location: true,
      price: true,
      rating: true,
      image: true,
      description: true,
      amenities: true,
      gallery: true,
      maxGuests: true,
      facilities: true,
      houseRules: true,
      areaInfo: true,
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-400">
          <Link href="/admin" className="hover:text-[#14213D] transition-colors">Admin</Link>
          <span className="text-gray-300">›</span>
          <Link href="/admin/properties" className="hover:text-[#14213D] transition-colors">Properties</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#14213D] font-medium">Edit #{property.id}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-6">
          <Image
            src="/brand/pearlora-logo.jpg"
            alt="Pearlora"
            width={24}
            height={24}
            className="rounded object-contain shrink-0"
            unoptimized
          />
          <span className="text-[#14213D] text-xs font-semibold tracking-widest uppercase">
            Pearlora Admin
          </span>
        </div>
        <EditPropertyForm property={property} />
      </div>
    </main>
  );
}
