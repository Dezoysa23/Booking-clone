"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("2 adults · 0 children · 1 room");

  const handleSearch = () => {
    const query = new URLSearchParams({
      destination,
      dates,
      guests,
    });

    console.log("Searching with:", {
      destination,
      dates,
      guests,
    });

    console.log("URL:", `/results?${query.toString()}`);

    router.push(`/results?${query.toString()}`);
  };

  return (
    <div className="mt-10 rounded-xl border-4 border-yellow-400 bg-white p-4 shadow-lg">
      <div className="grid gap-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Where are you going?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-3 text-gray-800 outline-none"
        />

        <input
          type="text"
          placeholder="Check-in — Check-out"
          value={dates}
          onChange={(e) => setDates(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-3 text-gray-800 outline-none"
        />

        <input
          type="text"
          placeholder="2 adults · 0 children · 1 room"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-3 text-gray-800 outline-none"
        />

        <button
          type="button"
          onClick={handleSearch}
          className="rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}