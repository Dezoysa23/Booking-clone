import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin, roleLabel } from "@/lib/roles";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (!isSuperAdmin(currentUser)) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
  });

  const ROLE_STYLES: Record<string, string> = {
    SUPER_ADMIN: "bg-[#14213d] text-white",
    ADMIN: "bg-[#14213d] text-white",
    HOST: "bg-[#d9a94d]/20 text-on-primary-fixed-variant",
    USER: "bg-slate-100 text-slate-600",
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link href="/admin" className="text-xs text-slate-400 hover:text-[#14213d] transition-colors">Admin</Link>
              <span className="text-slate-300 text-xs">›</span>
              <span className="text-xs text-[#14213d] font-medium">Users</span>
            </div>
            <h1 className="font-(family-name:--font-playfair-display) text-3xl font-semibold text-[#14213d]">
              All Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">{users.length} registered accounts</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white border border-[#e7ddc9] shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">User</th>
                <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Role</th>
                <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Bookings</th>
                <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-slate-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#14213d] text-sm">{user.name || "—"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-55">{user.email}</p>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-4 text-sm text-slate-600">{user._count.bookings}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-sm text-slate-500">
                    {user.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
