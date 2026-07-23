"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleSearch = () => {
    setError("");

    if (!destination.trim()) {
      setError("Please enter a destination to search.");
      return;
    }

    if (checkIn && checkOut && checkOut <= checkIn) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    const query = new URLSearchParams({ destination });
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);

    startTransition(() => {
      router.push(`/results?${query.toString()}`);
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(15,31,61,0.16)] border border-white/80 overflow-visible">
      <div className="flex flex-col md:flex-row items-stretch md:items-center p-2 md:p-2.5 gap-0">
        {/* Destination */}
        <div className="flex flex-1 items-center px-5 py-4 md:py-3 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex flex-col w-full">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#14213D]/50 mb-1">
              Destination
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14213D]/40 text-base shrink-0">
                location_on
              </span>
              <input
                type="text"
                placeholder="Where would you like to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full truncate text-gray-900 font-medium outline-none placeholder:text-[#7C879B]"
              />
            </div>
          </div>
        </div>

        {/* Check In */}
        <div className="flex items-center px-5 py-4 md:py-3 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex flex-col w-full min-w-[130px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#14213D]/50 mb-1">
              Check In
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14213D]/40 text-base shrink-0">
                event
              </span>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full text-gray-900 font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Check Out */}
        <div className="flex items-center px-5 py-4 md:py-3">
          <div className="flex flex-col w-full min-w-[130px]">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#14213D]/50 mb-1">
              Check Out
            </span>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#14213D]/40 text-base shrink-0">
                event
              </span>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm p-0 w-full text-gray-900 font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="px-3 pt-3 pb-3 md:p-1.5 md:pl-3 shrink-0">
          <button
            onClick={handleSearch}
            disabled={isPending}
            className="w-full md:w-auto bg-[#14213D] text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-[#16233F] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">search</span>
            {isPending ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 pb-4 -mt-1">
          <p className="text-xs text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
