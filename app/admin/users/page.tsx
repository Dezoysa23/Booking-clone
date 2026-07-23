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
    SUPER_ADMIN: "bg-[#14213D] text-white",
    ADMIN: "bg-[#14213D] text-white",
    HOST: "bg-[#D9A94D]/20 text-[#8a6c2a]",
    USER: "bg-gray-100 text-gray-600",
  };

  return (
    <main className="min-h-screen bg-[#F8F2E9] px-4 md:px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Link href="/admin" className="text-xs text-gray-400 hover:text-[#14213D] transition-colors">Admin</Link>
              <span className="text-gray-300 text-xs">›</span>
              <span className="text-xs text-[#14213D] font-medium">Users</span>
            </div>
            <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D]">
              All Users
            </h1>
            <p className="mt-1 text-sm text-gray-500">{users.length} registered accounts</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-[#F8F2E9]">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">User</th>
                <th className="hidden md:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Role</th>
                <th className="hidden sm:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Bookings</th>
                <th className="hidden lg:table-cell px-5 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#F8F2E9] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#14213D] text-sm">{user.name || "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{user.email}</p>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${ROLE_STYLES[user.role] ?? ROLE_STYLES.USER}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-5 py-4 text-sm text-gray-600">{user._count.bookings}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-sm text-gray-500">
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
