import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSubscription } from "@/lib/subscription";
import CancelPlanButton from "@/components/CancelPlanButton";

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border border-green-100",
  PENDING: "bg-[#eef2fa] text-[#071B63] border border-[#071B63]/10",
  FAILED: "bg-red-50 text-red-600 border border-red-100",
  REFUNDED: "bg-orange-50 text-orange-600",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const SUB_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-50 text-red-600",
  PAST_DUE: "bg-orange-50 text-orange-600",
  EXPIRED: "bg-gray-100 text-gray-400",
};

export default async function HostBillingPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [subscription, payments] = await Promise.all([
    getSubscription(currentUser.id),
    prisma.payment.findMany({
      where: { userId: currentUser.id },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d]">
          Billing
        </h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription and view payment history.</p>
      </div>

      {/* Current subscription */}
      <div className="mb-8 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Current Plan</h2>
        {subscription ? (
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-lg font-bold text-[#0f1f3d]">{subscription.plan.name}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${SUB_STATUS_STYLES[subscription.status] ?? SUB_STATUS_STYLES.INACTIVE}`}>
                  {subscription.status.charAt(0) + subscription.status.slice(1).toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {subscription.billingCycle === "YEARLY" ? "Yearly" : "Monthly"} billing
                {subscription.endDate && ` · Renews ${subscription.endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              </p>
            </div>
            <div className="flex gap-3">
              {subscription.status !== "CANCELLED" && (
                <CancelPlanButton />
              )}
              <Link
                href="/pricing"
                className="rounded-lg bg-[#071B63] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123EAF] transition-colors"
              >
                Change Plan
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">You have no active subscription.</p>
            <Link href="/pricing" className="rounded-lg bg-[#D8B45A] px-5 py-2.5 text-xs font-semibold text-[#071B63] hover:bg-[#c9a84c] transition-colors">
              View Plans
            </Link>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-sm text-gray-500">No payment records yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#faf8f5]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Plan</th>
                  <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Status</th>
                  <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-[#0f1f3d]">{payment.subscription.plan.name}</td>
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
    </div>
  );
}
