"use client";

import { useRouter } from "next/navigation";

type Props = {
  label?: string;
};

export default function BackButton({ label = "Go Back" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      <span className="text-gray-400">←</span>
      {label}
    </button>
  );
}
