import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CreatePropertyForm from "@/components/CreatePropertyForm";

export default async function NewPropertyPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  if (currentUser.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <CreatePropertyForm />
      </div>
    </main>
  );
}