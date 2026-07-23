import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canCreateProperty } from "@/lib/subscription";
import PropertyForm from "@/components/PropertyForm";
import { redirect } from "next/navigation";

export default async function HostNewPropertyPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const gate = await canCreateProperty(currentUser.id);
  if (!gate.allowed) {
    redirect(gate.upgradeRequired ? "/pricing?upgrade=1" : "/pricing");
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-6 text-xs text-slate-400">
        <Link href="/host/dashboard" className="hover:text-[#14213d] transition-colors">Dashboard</Link>
        <span className="text-slate-300">›</span>
        <Link href="/host/properties" className="hover:text-[#14213d] transition-colors">Properties</Link>
        <span className="text-slate-300">›</span>
        <span className="text-[#14213d] font-medium">New Property</span>
      </div>
      <div className="max-w-4xl">
        <PropertyForm
          mode="create"
          apiBase="/api/host/properties"
          cancelPath="/host/properties"
          successPath="/host/properties"
        />
      </div>
    </div>
  );
}
