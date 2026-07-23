"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="page-gradient flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/90 p-10 shadow-[0_14px_34px_rgba(11,31,58,0.12)] backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <span className="material-symbols-outlined text-2xl" aria-hidden="true">
            error
          </span>
        </div>
        <h1 className="mt-5 font-(family-name:--font-playfair-display) text-2xl font-semibold text-[#14213d]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We&apos;re sorry for the inconvenience. Please try again, or return
          home if the problem persists.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button variant="primary" icon="refresh" onClick={() => reset()}>
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
