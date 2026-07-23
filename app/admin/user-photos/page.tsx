import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import UserPhotoModerationClient from "./UserPhotoModerationClient";

export default async function AdminUserPhotosPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isSuperAdmin(currentUser)) redirect("/");

  const photos = await prisma.userPropertyPhoto.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, email: true } },
      property: { select: { id: true, name: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-1.5 mb-4 text-xs text-[#7C879B]">
          <Link href="/admin" className="hover:text-[#14213D] transition-colors">Admin</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#14213D] font-medium">Photo Moderation</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              Photo Moderation
            </h1>
            <p className="mt-1 text-sm text-[#5B6472]">
              Review and approve or reject guest-submitted photos.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <span className="material-symbols-outlined text-sm">hourglass_empty</span>
            {photos.length} pending
          </span>
        </div>

        <UserPhotoModerationClient initialPhotos={photos} />
      </div>
    </main>
  );
}
