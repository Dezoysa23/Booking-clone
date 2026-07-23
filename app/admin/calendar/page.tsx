import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/roles";
import CalendarView from "./CalendarView";

export const metadata = {
  title: "Admin Calendar — Pearlora",
};

export default async function AdminCalendarPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isSuperAdmin(currentUser)) redirect("/");

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-slate-400">
          <Link href="/admin" className="hover:text-[#14213d] transition-colors">Admin</Link>
          <span className="text-slate-300">›</span>
          <span className="text-[#14213d] font-medium">Calendar</span>
        </div>

        {/* Page header */}
        <div className="rounded-2xl admin-header-gradient px-8 py-7 mb-8 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/brand/Pearlora-logo-only.png"
                alt="Pearlora"
                width={24}
                height={24}
                className="rounded object-contain shrink-0"
              />
              <span className="text-[#d9a94d] text-xs font-semibold tracking-widest uppercase">
                Pearlora Admin
              </span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-2xl md:text-3xl font-semibold text-white">
              Platform Calendar
            </h1>
            <p className="mt-1 text-white/50 text-sm">
              Bookings, check-ins, payments, and subscriptions at a glance.
            </p>
          </div>
          <div className="shrink-0 hidden md:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <span className="material-symbols-outlined text-[#d9a94d] text-3xl">calendar_month</span>
          </div>
        </div>

        {/* Interactive calendar */}
        <CalendarView />
      </div>
    </main>
  );
}
