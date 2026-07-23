"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const DESTINATION_OPTIONS = [
  "Colombo",
  "Galle",
  "Ella",
  "Kandy",
  "Mirissa",
  "Sigiriya",
];

export default function SearchBox() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [partyOpen, setPartyOpen] = useState(false);
  const [error, setError] = useState("");

  const partyRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  // Close the guests/rooms popover on outside click or Escape.
  useEffect(() => {
    if (!partyOpen) return;
    const onDown = (e: MouseEvent) => {
      if (partyRef.current && !partyRef.current.contains(e.target as Node)) {
        setPartyOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPartyOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [partyOpen]);

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
    query.set("guests", String(guests));
    query.set("rooms", String(rooms));

    startTransition(() => {
      router.push(`/results?${query.toString()}`);
    });
  };

  const fieldWrap = "flex flex-col gap-1 px-5 py-3.5 md:py-3";
  const fieldLabel =
    "text-[10px] font-bold uppercase tracking-[0.14em] text-[#14213d]/55";
  const fieldInput =
    "w-full border-none bg-transparent p-0 text-sm font-medium text-[#16233f] outline-none placeholder:text-[#7c879b] focus:ring-0";

  return (
    <div className="overflow-visible rounded-2xl border border-white/80 bg-white shadow-[0_18px_50px_rgba(43,32,22,0.18)]">
      <div className="flex flex-col items-stretch gap-0 p-2 md:flex-row md:items-center md:p-2.5">
        {/* Destination */}
        <div
          className={`${fieldWrap} flex-1 border-b border-[#f1e7d6] md:border-b-0 md:border-r`}
        >
          <label htmlFor="sb-destination" className={fieldLabel}>
            Destination
          </label>
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined shrink-0 text-base text-[#d9a94d]"
              aria-hidden="true"
            >
              location_on
            </span>
            <input
              id="sb-destination"
              name="destination"
              type="text"
              list="sb-destinations"
              autoComplete="off"
              placeholder="Where would you like to go?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className={`${fieldInput} truncate`}
            />
            <datalist id="sb-destinations">
              {DESTINATION_OPTIONS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Check In */}
        <div className={`${fieldWrap} border-b border-[#f1e7d6] md:border-b-0 md:border-r`}>
          <label htmlFor="sb-checkin" className={fieldLabel}>
            Check In
          </label>
          <div className="flex min-w-[130px] items-center gap-2">
            <span
              className="material-symbols-outlined shrink-0 text-base text-[#d9a94d]"
              aria-hidden="true"
            >
              event
            </span>
            <input
              id="sb-checkin"
              name="checkIn"
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className={fieldInput}
            />
          </div>
        </div>

        {/* Check Out */}
        <div className={`${fieldWrap} border-b border-[#f1e7d6] md:border-b-0 md:border-r`}>
          <label htmlFor="sb-checkout" className={fieldLabel}>
            Check Out
          </label>
          <div className="flex min-w-[130px] items-center gap-2">
            <span
              className="material-symbols-outlined shrink-0 text-base text-[#d9a94d]"
              aria-hidden="true"
            >
              event
            </span>
            <input
              id="sb-checkout"
              name="checkOut"
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className={fieldInput}
            />
          </div>
        </div>

        {/* Guests + Rooms popover */}
        <div ref={partyRef} className={`${fieldWrap} relative`}>
          <span className={fieldLabel}>Guests</span>
          <button
            type="button"
            onClick={() => setPartyOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={partyOpen}
            className="flex min-w-37.5 items-center gap-2 text-left"
          >
            <span
              className="material-symbols-outlined shrink-0 text-base text-[#d9a94d]"
              aria-hidden="true"
            >
              group
            </span>
            <span className="text-sm font-medium text-[#16233f]">
              {guests} {guests === 1 ? "guest" : "guests"} · {rooms}{" "}
              {rooms === 1 ? "room" : "rooms"}
            </span>
          </button>

          {partyOpen ? (
            <div
              role="dialog"
              aria-label="Select guests and rooms"
              className="absolute left-3 top-[calc(100%+0.5rem)] z-30 w-64 rounded-2xl border border-[#e7ddc9] bg-white p-4 shadow-[0_18px_44px_rgba(43,32,22,0.18)]"
            >
              <Stepper
                label="Guests"
                value={guests}
                min={1}
                max={20}
                onChange={setGuests}
              />
              <div className="my-3 h-px bg-[#f1e7d6]" />
              <Stepper
                label="Rooms"
                value={rooms}
                min={1}
                max={10}
                onChange={setRooms}
              />
            </div>
          ) : null}
        </div>

        {/* Search button */}
        <div className="shrink-0 px-3 pb-3 pt-3 md:p-1.5 md:pl-3">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d9a94d] px-8 py-3.5 text-sm font-semibold text-[#14213d] transition-all hover:bg-[#c4922f] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">
              search
            </span>
            {isPending ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="-mt-1 px-6 pb-4">
          <p className="text-center text-xs text-[#c0392b]">{error}</p>
        </div>
      ) : null}
    </div>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  const btn =
    "flex h-8 w-8 items-center justify-center rounded-full border border-[#e7ddc9] text-[#14213d] transition-colors hover:border-[#d9a94d] hover:bg-[#f4ecd8] disabled:opacity-40 disabled:hover:border-[#e7ddc9] disabled:hover:bg-transparent";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-[#16233f]">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={btn}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            remove
          </span>
        </button>
        <span className="w-5 text-center text-sm font-semibold text-[#14213d]">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={btn}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            add
          </span>
        </button>
      </div>
    </div>
  );
}
