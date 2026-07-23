import { Skeleton } from "@/components/ui";

export default function PropertyLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-9 w-2/3" />
      <Skeleton className="mt-2 h-4 w-48" />
      <Skeleton className="mt-6 h-105 w-full rounded-2xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </main>
  );
}
