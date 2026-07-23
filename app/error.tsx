"use client";

import Link from "next/link";
import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#F8F2E9] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 border border-red-100 mb-6">
          <span className="material-symbols-outlined text-red-400 text-2xl">
            error_outline
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-[#D9A94D] text-sm">✦</span>
          <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">
            Something went wrong
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-playfair-display)] text-3xl font-semibold text-[#14213D] mb-3">
          An unexpected error occurred
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          We&apos;re sorry for the inconvenience. Please try again, or return
          home if the problem persists.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[#14213D] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#16233F] transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
