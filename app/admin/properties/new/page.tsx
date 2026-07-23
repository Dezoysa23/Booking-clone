import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import CreatePropertyForm from "@/components/CreatePropertyForm";

export default async function NewPropertyPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (!isSuperAdmin(currentUser)) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center gap-1.5 mb-4 text-xs text-gray-400">
          <Link href="/admin" className="hover:text-[#071B63] transition-colors">Admin</Link>
          <span className="text-gray-300">›</span>
          <Link href="/admin/properties" className="hover:text-[#071B63] transition-colors">Properties</Link>
          <span className="text-gray-300">›</span>
          <span className="text-[#071B63] font-medium">New Property</span>
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
          <span className="text-[#071B63] text-xs font-semibold tracking-widest uppercase">
            Pearlora Admin
          </span>
        </div>
        <CreatePropertyForm />
      </div>
    </main>
  );
}