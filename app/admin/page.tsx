import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-md">
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>

        <p className="mt-3 text-gray-600">
          Manage properties and platform content.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin/properties/new"
            className="rounded-xl bg-blue-600 p-6 text-white shadow-md hover:bg-blue-700"
          >
            <h2 className="text-2xl font-bold">Add New Property</h2>
            <p className="mt-2 text-blue-100">
              Create a new property listing.
            </p>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-gray-300 bg-white p-6 text-gray-900 shadow-md hover:bg-gray-50"
          >
            <h2 className="text-2xl font-bold">Back to Site</h2>
            <p className="mt-2 text-gray-600">
              Return to the main booking website.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}