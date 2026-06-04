import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/roles";

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border border-green-100",
  PENDING: "bg-[#eef2fa] text-[#071B63] border border-[#071B63]/10",
  FAILED: "bg-red-50 text-red-600 border border-red-100",
  REFUNDED: "bg-orange-50 text-orange-600 border border-orange-100",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function AdminPaymentsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isSuperAdmin(currentUser)) redirect("/");

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      subscription: { include: { plan: { select: { name: true } } } },
    },
  });

  const totalRevenue = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link href="/admin" className="text-xs text-gray-400 hover:text-[#0f1f3d] transition-colors">Admin</Link>
              <span className="text-gray-300 text-xs">›</span>
              <span className="text-xs text-[#0f1f3d] font-medium">Payments</span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
              Payments
            </h1>
            <p className="mt-1 text-sm text-gray-500">{payments.length} transactions · LKR {totalRevenue.toLocaleString()} revenue</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Dashboard
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-gray-500 text-sm">No payment records yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#faf8f5]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">User</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Plan</th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0f1f3d] text-sm">{payment.user.name || "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{payment.user.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{payment.subscription.plan.name}</td>
                    <td className="hidden sm:table-cell px-5 py-4 text-sm font-semibold text-[#0f1f3d]">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[payment.paymentStatus] ?? STATUS_STYLES.PENDING}`}>
                        {payment.paymentStatus.charAt(0) + payment.paymentStatus.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-500">
                      {payment.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
