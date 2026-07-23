import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  INACTIVE: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-rose-50 text-rose-600 border border-rose-100",
  PAST_DUE: "bg-[#f4ecd8] text-[#c4922f] border border-[#f4ecd8]",
  EXPIRED: "bg-slate-100 text-slate-500",
};

export default async function AdminSubscriptionsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isSuperAdmin(currentUser)) redirect("/");

  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      plan: { select: { id: true, name: true, slug: true } },
    },
  });

  const activeCount = subscriptions.filter((s) => s.status === "ACTIVE").length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link href="/admin" className="text-xs text-slate-400 hover:text-[#14213d] transition-colors">Admin</Link>
              <span className="text-slate-300 text-xs">›</span>
              <span className="text-xs text-[#14213d] font-medium">Subscriptions</span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              Subscriptions
            </h1>
            <p className="mt-1 text-sm text-slate-500">{activeCount} active · {subscriptions.length} total</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Dashboard
          </Link>
        </div>

        {subscriptions.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-16 text-center">
            <p className="text-slate-500 text-sm">No subscriptions yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl bg-white border border-[#e7ddc9] shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Host</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Plan</th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Cycle</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#14213d] text-sm">{sub.user.name || "—"}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate max-w-50">{sub.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 font-medium">{sub.plan.name}</td>
                    <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-500">{sub.billingCycle === "YEARLY" ? "Yearly" : "Monthly"}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[sub.status] ?? STATUS_STYLES.INACTIVE}`}>
                        {sub.status.charAt(0) + sub.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-500">
                      {sub.endDate ? sub.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
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
