import Link from "next/link";
import { buttonVariants } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="page-gradient flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/90 p-10 shadow-[0_14px_34px_rgba(11,31,58,0.12)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4ecd8] text-[#d9a94d]">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            search_off
          </span>
        </div>
        <p className="mt-5 font-(family-name:--font-playfair-display) text-5xl font-semibold text-[#14213d]">
          404
        </p>
        <h1 className="mt-2 font-(family-name:--font-playfair-display) text-xl font-semibold text-[#14213d]">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          The page you&apos;re looking for may have been moved, deleted, or never
          existed. Let&apos;s get you back on track.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className={buttonVariants({ variant: "primary" })}>
            Back to Home
          </Link>
          <Link
            href="/results?destination="
            className={buttonVariants({ variant: "outline" })}
          >
            Browse Stays
          </Link>
        </div>
      </div>
    </main>
  );
}
