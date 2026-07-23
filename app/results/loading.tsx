import { Skeleton } from "@/components/ui";

export default function ResultsLoading() {
  return (
    <main className="page-gradient min-h-screen px-4 py-10 md:px-6">
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white"
            >
              <Skeleton className="h-56 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-4 h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
