"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const OPTIONS = [
  { value: "", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Rating: Best First" },
  { value: "rating_asc", label: "Rating: Lowest First" },
];

export default function ResultsSortControl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get("sortBy") || "";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sortBy", value);
    else params.delete("sortBy");
    startTransition(() => router.push(`/results?${params.toString()}`));
  };

  return (
    <label className="flex items-center gap-2 text-sm text-on-surface-variant">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending}
        className="rounded-full border border-[#e7ddc9] bg-white px-4 py-2 text-sm font-medium text-[#14213d] outline-none transition-colors focus:border-[#d9a94d] focus:ring-2 focus:ring-[#d9a94d]/30 disabled:opacity-60"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
