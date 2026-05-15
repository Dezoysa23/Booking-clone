import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0f1f3d]/8 mb-6">
          <span className="material-symbols-outlined text-[#0f1f3d]/40 text-2xl">
            search_off
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[#c9a84c] text-sm">✦</span>
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            404 — Page Not Found
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#0f1f3d] mb-3">
          We couldn&apos;t find that page
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          The page you&apos;re looking for may have been moved, deleted, or
          never existed. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/"
            className="rounded-lg bg-[#071B63] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#123EAF] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/results?destination="
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    </main>
  );
}
