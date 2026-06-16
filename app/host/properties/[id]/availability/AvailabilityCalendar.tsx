"use client";

import { useCallback, useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Room = {
  id: string;
  name: string;
  description: string | null;
  maxGuests: number | null;
  isActive: boolean;
  sortOrder: number;
};

type BookingEntry = {
  id: number;
  checkIn: string;  // ISO string
  checkOut: string; // ISO string
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  guests: number;
};

type Block = {
  id: string;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  reason: string;
  note: string | null;
};

type DayState =
  | "past"
  | "available"
  | "booked-confirmed"
  | "booked-pending"
  | "blocked"
  | "selection-active";

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const REASON_LABELS: Record<string, string> = {
  MAINTENANCE: "Maintenance",
  PERSONAL_USE: "Personal Use",
  RENOVATION: "Renovation",
  CLEANING: "Cleaning / Preparation",
  SEASONAL_CLOSURE: "Seasonal Closure",
  OTHER: "Other",
};

const REASON_OPTIONS = Object.entries(REASON_LABELS);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildGrid(year: number, month: number) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevDays = new Date(year, month - 1, 0).getDate();

  const cells: { day: number; current: boolean; key: string }[] = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDays - i;
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    cells.push({ day: d, current: false, key: `${py}-${String(pm).padStart(2,"0")}-${String(d).padStart(2,"0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, key: `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}` });
  }
  const fill = 42 - cells.length;
  for (let d = 1; d <= fill; d++) {
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;
    cells.push({ day: d, current: false, key: `${ny}-${String(nm).padStart(2,"0")}-${String(d).padStart(2,"0")}` });
  }
  return cells;
}

function isoToKey(iso: string): string {
  return iso.split("T")[0];
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00Z");
  const e = new Date(end + "T00:00:00Z");
  return Math.round((e.getTime() - s.getTime()) / 86_400_000);
}

function addDays(key: string, n: number): string {
  const d = new Date(key + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  propertyId: number;
};

export default function AvailabilityCalendar({ propertyId }: Props) {
  const localNow = new Date();
  const todayKey = localDateKey(localNow);

  // ── Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomMax, setNewRoomMax] = useState("");
  const [addingRoom, setAddingRoom] = useState(false);
  const [roomError, setRoomError] = useState("");

  // ── Calendar state
  const [year, setYear] = useState(localNow.getFullYear());
  const [month, setMonth] = useState(localNow.getMonth() + 1);
  const [bookings, setBookings] = useState<BookingEntry[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState("");

  // ── Selection state (range: click start, click end)
  const [selStart, setSelStart] = useState<string | null>(null);
  const [selEnd, setSelEnd] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  // ── Block creation
  const [reason, setReason] = useState("MAINTENANCE");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blockError, setBlockError] = useState("");

  // ── Block deletion
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  // ─── Fetch rooms on mount ────────────────────────────────────────────────────
  // Uses functional updater so selectedRoomId is NOT a dependency — avoids
  // a double-fetch where setting the initial room triggers a second call.
  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch(`/api/host/properties/${propertyId}/rooms`);
      const data = await res.json();
      if (res.ok) {
        const fetched: Room[] = data.rooms ?? [];
        setRooms(fetched);
        setSelectedRoomId((prev) => prev ?? (fetched[0]?.id ?? null));
      }
    } catch {
      // silent
    } finally {
      setRoomsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  // ─── Fetch calendar data whenever room/month changes ────────────────────────
  const fetchAvailability = useCallback(async () => {
    if (!selectedRoomId) return;
    setCalLoading(true);
    setCalError("");
    try {
      const res = await fetch(
        `/api/host/properties/${propertyId}/rooms/${selectedRoomId}/availability?year=${year}&month=${month}`
      );
      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings ?? []);
        setBlocks(data.blocks ?? []);
      } else {
        setCalError(data.error ?? "Failed to load.");
      }
    } catch {
      setCalError("Network error. Please try again.");
    } finally {
      setCalLoading(false);
    }
  }, [propertyId, selectedRoomId, year, month]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  // ─── Add room ──────────────────────────────────────────────────────────────
  const handleAddRoom = async () => {
    const name = newRoomName.trim();
    if (!name) { setRoomError("Room name is required."); return; }
    setAddingRoom(true);
    setRoomError("");
    try {
      const res = await fetch(`/api/host/properties/${propertyId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: newRoomDesc.trim() || null,
          maxGuests: newRoomMax ? Number(newRoomMax) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setRoomError(data.error ?? "Failed to create room."); return; }
      setRooms((prev) => [...prev, data.room]);
      setSelectedRoomId(data.room.id);
      setShowAddRoom(false);
      setNewRoomName("");
      setNewRoomDesc("");
      setNewRoomMax("");
    } catch {
      setRoomError("Network error. Please try again.");
    } finally {
      setAddingRoom(false);
    }
  };

  // ─── Date state calculation ────────────────────────────────────────────────
  function getDayState(key: string): DayState {
    // Past dates (before today)
    if (key < todayKey) return "past";

    // Within active selection range?
    if (selStart) {
      const effectiveEnd = selEnd ?? (hovered && hovered >= selStart ? hovered : selStart);
      const [s, e] = selStart <= effectiveEnd ? [selStart, effectiveEnd] : [effectiveEnd, selStart];
      if (key >= s && key <= e) return "selection-active";
    }

    // Blocked by host?
    for (const b of blocks) {
      if (key >= isoToKey(b.startDate) && key < isoToKey(b.endDate)) return "blocked";
    }

    // Booked?
    for (const bk of bookings) {
      if (key >= isoToKey(bk.checkIn) && key < isoToKey(bk.checkOut)) {
        return bk.status === "CONFIRMED" ? "booked-confirmed" : "booked-pending";
      }
    }

    return "available";
  }

  // ─── Date click handling ───────────────────────────────────────────────────
  function handleDateClick(key: string, state: DayState) {
    if (state === "past") return;

    if (state === "booked-confirmed" || state === "booked-pending") {
      // Cannot select booked dates
      setBlockError("Booked dates cannot be selected. Manage bookings from the Bookings page.");
      return;
    }

    if (state === "blocked") {
      // Find and confirm-remove the block
      const block = blocks.find(
        (b) => key >= isoToKey(b.startDate) && key < isoToKey(b.endDate)
      );
      if (block) {
        setConfirmRemoveId(block.id);
        setSelStart(null);
        setSelEnd(null);
      }
      return;
    }

    // Selection logic
    setBlockError("");
    setConfirmRemoveId(null);

    if (!selStart) {
      setSelStart(key);
      setSelEnd(null);
      return;
    }

    if (!selEnd) {
      if (key === selStart) {
        // Toggle off
        setSelStart(null);
        return;
      }
      if (key >= selStart) {
        setSelEnd(key);
      } else {
        // New start before current start
        setSelStart(key);
        setSelEnd(null);
      }
      return;
    }

    // Both set — reset and start new selection
    setSelStart(key);
    setSelEnd(null);
  }

  // ─── Create block ──────────────────────────────────────────────────────────
  const handleCreateBlock = async () => {
    if (!selectedRoomId || !selStart) return;
    const start = selStart <= (selEnd ?? selStart) ? selStart : (selEnd ?? selStart);
    const endInclusive = selStart <= (selEnd ?? selStart) ? (selEnd ?? selStart) : selStart;
    const endExclusive = addDays(endInclusive, 1); // convert inclusive end to exclusive

    setSubmitting(true);
    setBlockError("");
    try {
      const res = await fetch(
        `/api/host/properties/${propertyId}/rooms/${selectedRoomId}/availability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startDate: start, endDate: endExclusive, reason, note }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setBlockError(data.error ?? "Failed to create block."); return; }
      setBlocks((prev) => [...prev, data.block]);
      setSelStart(null);
      setSelEnd(null);
      setNote("");
    } catch {
      setBlockError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Delete block ──────────────────────────────────────────────────────────
  const handleDeleteBlock = async (blockId: string) => {
    setRemovingId(blockId);
    try {
      const res = await fetch(
        `/api/host/properties/${propertyId}/rooms/${selectedRoomId}/availability/${blockId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        setConfirmRemoveId(null);
      }
    } catch {
      // silent
    } finally {
      setRemovingId(null);
    }
  };

  // ─── Month navigation ──────────────────────────────────────────────────────
  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  // ─── Derived values ────────────────────────────────────────────────────────
  const grid = buildGrid(year, month);
  const selectionDays = selStart
    ? daysBetween(
        selStart <= (selEnd ?? selStart) ? selStart : (selEnd ?? selStart),
        addDays(selStart <= (selEnd ?? selStart) ? (selEnd ?? selStart) : selStart, 1)
      )
    : 0;

  const confirmBlock = blocks.find((b) => b.id === confirmRemoveId);

  // ─── Cell style ───────────────────────────────────────────────────────────
  function cellClass(key: string, state: DayState, current: boolean): string {
    const base = "relative flex flex-col items-center justify-start pt-1 h-10 rounded-lg transition-all duration-100 text-xs font-medium select-none";
    if (!current) return `${base} text-gray-200 cursor-default`;
    switch (state) {
      case "past":           return `${base} text-gray-300 cursor-default`;
      case "booked-confirmed":return `${base} bg-blue-100 text-blue-700 cursor-not-allowed`;
      case "booked-pending": return `${base} bg-amber-100 text-amber-700 cursor-not-allowed`;
      case "blocked":        return `${base} bg-orange-100 text-orange-700 cursor-pointer hover:bg-orange-200`;
      case "selection-active":return `${base} bg-[#071B63] text-white cursor-pointer`;
      default: // available
        return key === todayKey
          ? `${base} ring-2 ring-[#D8B45A] text-[#0f1f3d] font-bold cursor-pointer hover:bg-emerald-50`
          : `${base} text-gray-700 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700`;
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#071B63] focus:bg-white focus:ring-2 focus:ring-[#071B63]/10";
  const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400";

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ── Room selector ── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-lg font-semibold text-[#0f1f3d]">
            Rooms
          </h2>
          <button
            type="button"
            onClick={() => { setShowAddRoom((v) => !v); setRoomError(""); }}
            className="flex items-center gap-1.5 rounded-lg bg-[#071B63] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123EAF] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Room
          </button>
        </div>

        {roomsLoading ? (
          <p className="text-sm text-gray-400">Loading rooms…</p>
        ) : (
          <>
            {rooms.length === 0 && !showAddRoom && (
              <div className="rounded-xl bg-[#faf8f5] border border-gray-100 p-6 text-center">
                <span className="material-symbols-outlined text-gray-300 text-3xl">meeting_room</span>
                <p className="mt-2 text-sm text-gray-500">No rooms yet. Add your first room to manage availability.</p>
              </div>
            )}

            {rooms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => { setSelectedRoomId(room.id); setSelStart(null); setSelEnd(null); }}
                    className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all ${
                      selectedRoomId === room.id
                        ? "border-[#071B63] bg-[#071B63]/5 font-semibold text-[#071B63]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">meeting_room</span>
                    {room.name}
                    {room.maxGuests && (
                      <span className="text-xs text-gray-400">· {room.maxGuests}g</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Add room form */}
            {showAddRoom && (
              <div className="mt-4 rounded-xl border border-[#071B63]/15 bg-[#071B63]/3 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#0f1f3d]">New Room</h3>
                {roomError && <p className="text-xs text-red-600">{roomError}</p>}
                <div>
                  <label className={labelClass}>Room Name *</label>
                  <input type="text" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                    className={inputClass} placeholder="e.g. Suite A, Room 101, Garden Cottage" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Description (optional)</label>
                    <input type="text" value={newRoomDesc} onChange={(e) => setNewRoomDesc(e.target.value)}
                      className={inputClass} placeholder="Ocean-facing double room" />
                  </div>
                  <div>
                    <label className={labelClass}>Max Guests (optional)</label>
                    <input type="number" value={newRoomMax} onChange={(e) => setNewRoomMax(e.target.value)}
                      className={inputClass} placeholder="e.g. 2" min="1" max="50" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddRoom} disabled={addingRoom}
                    className="rounded-lg bg-[#071B63] px-4 py-2 text-xs font-semibold text-white hover:bg-[#123EAF] transition-colors disabled:opacity-60">
                    {addingRoom ? "Creating…" : "Create Room"}
                  </button>
                  <button onClick={() => { setShowAddRoom(false); setRoomError(""); }}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Calendar (only shown when a room is selected) ── */}
      {selectedRoomId && (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Calendar card */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            {/* Month navigation */}
            <div className="bg-gradient-to-br from-[#0f1f3d] to-[#1a3a6b] px-5 py-4">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 transition-colors text-white">
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-playfair-display)] text-white font-semibold">
                    {MONTHS[month - 1]} {year}
                  </p>
                  {calLoading && <p className="text-white/50 text-xs mt-0.5">Loading…</p>}
                </div>
                <button onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15 transition-colors text-white">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="p-4">
              {calError && (
                <p className="mb-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">{calError}</p>
              )}

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest py-1">{d}</div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {grid.map((cell, i) => {
                  const state = getDayState(cell.key);
                  const isToday = cell.key === todayKey;
                  const isBlockedConfirm = confirmRemoveId
                    ? blocks.find((b) => b.id === confirmRemoveId) &&
                      cell.key >= isoToKey(blocks.find((b) => b.id === confirmRemoveId)!.startDate) &&
                      cell.key < isoToKey(blocks.find((b) => b.id === confirmRemoveId)!.endDate)
                    : false;

                  return (
                    <div
                      key={i}
                      className={cellClass(cell.key, state, cell.current) + (isBlockedConfirm ? " ring-2 ring-red-400" : "")}
                      onClick={() => cell.current && handleDateClick(cell.key, state)}
                      onMouseEnter={() => cell.current && selStart && !selEnd && setHovered(cell.key)}
                      onMouseLeave={() => setHovered(null)}
                      title={
                        state === "booked-confirmed" ? "Confirmed booking"
                        : state === "booked-pending" ? "Pending booking"
                        : state === "blocked" ? "Blocked — click to remove"
                        : state === "past" ? "Past"
                        : ""
                      }
                    >
                      <span className={`leading-none ${isToday && state !== "selection-active" ? "font-bold" : ""}`}>
                        {cell.day}
                      </span>
                      {/* Status dots */}
                      {cell.current && state !== "past" && state !== "selection-active" && (
                        <span className={`h-1 w-1 rounded-full mt-0.5 ${
                          state === "booked-confirmed" ? "bg-blue-400"
                          : state === "booked-pending" ? "bg-amber-400"
                          : state === "blocked" ? "bg-orange-400"
                          : ""
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-100 pt-4">
                {[
                  { color: "bg-emerald-400", label: "Available" },
                  { color: "bg-blue-400",    label: "Confirmed booking" },
                  { color: "bg-amber-400",   label: "Pending booking" },
                  { color: "bg-orange-400",  label: "Blocked by you" },
                  { color: "bg-[#071B63]",   label: "Selected" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            {/* Confirm remove block panel */}
            {confirmBlock && (
              <div className="rounded-2xl bg-red-50 border border-red-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-red-500 text-base">block</span>
                  <p className="text-sm font-semibold text-red-800">Remove Block?</p>
                </div>
                <p className="text-xs text-red-700 mb-1">
                  <strong>Reason:</strong> {REASON_LABELS[confirmBlock.reason] ?? confirmBlock.reason}
                </p>
                <p className="text-xs text-red-700 mb-1">
                  <strong>Dates:</strong> {isoToKey(confirmBlock.startDate)} → {isoToKey(confirmBlock.endDate)}
                </p>
                {confirmBlock.note && (
                  <p className="text-xs text-red-700 mb-3">
                    <strong>Note:</strong> {confirmBlock.note}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteBlock(confirmBlock.id)}
                    disabled={!!removingId}
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {removingId === confirmBlock.id ? "Removing…" : "Yes, Remove Block"}
                  </button>
                  <button onClick={() => setConfirmRemoveId(null)}
                    className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Block creation panel */}
            {!confirmBlock && (
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                <h3 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#0f1f3d] mb-4">
                  Block Dates
                </h3>

                {!selStart ? (
                  <div className="rounded-xl bg-[#faf8f5] border border-gray-100 p-4 text-center">
                    <span className="material-symbols-outlined text-gray-300 text-2xl">touch_app</span>
                    <p className="mt-1 text-xs text-gray-400">Click a date on the calendar to start selecting</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl bg-[#071B63]/5 border border-[#071B63]/10 px-4 py-3">
                      <p className="text-xs font-semibold text-[#071B63] uppercase tracking-widest mb-1">Selected</p>
                      <p className="text-sm font-semibold text-[#0f1f3d]">
                        {selStart}
                        {selEnd && selEnd !== selStart ? ` → ${selEnd}` : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectionDays} {selectionDays === 1 ? "day" : "days"}
                        {!selEnd ? " — click a second date to set range" : ""}
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>Reason *</label>
                      <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
                        {REASON_OPTIONS.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Note (optional)</label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className={inputClass}
                        placeholder="e.g. Annual servicing, family visit…"
                        maxLength={500}
                      />
                    </div>

                    {blockError && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {blockError}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateBlock}
                        disabled={submitting || !selStart}
                        className="flex-1 rounded-lg bg-[#071B63] py-2.5 text-xs font-semibold text-white hover:bg-[#123EAF] transition-colors disabled:opacity-60"
                      >
                        {submitting ? "Blocking…" : `Block ${selectionDays} ${selectionDays === 1 ? "Day" : "Days"}`}
                      </button>
                      <button
                        onClick={() => { setSelStart(null); setSelEnd(null); setBlockError(""); }}
                        className="rounded-lg border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active blocks list */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <h3 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[#0f1f3d] mb-3">
                Active Blocks
              </h3>
              {blocks.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No manual blocks for this room.</p>
              ) : (
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <div key={block.id}
                      className={`rounded-xl border px-3 py-2.5 transition-colors ${
                        confirmRemoveId === block.id
                          ? "border-red-200 bg-red-50"
                          : "border-orange-100 bg-orange-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-orange-800">
                            {REASON_LABELS[block.reason] ?? block.reason}
                          </p>
                          <p className="text-[11px] text-orange-600 mt-0.5">
                            {isoToKey(block.startDate)} → {isoToKey(block.endDate)}
                          </p>
                          {block.note && (
                            <p className="text-[11px] text-orange-500 mt-0.5 italic truncate">{block.note}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setConfirmRemoveId(block.id === confirmRemoveId ? null : block.id)}
                          className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-orange-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove block"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How to use hint */}
            <div className="rounded-2xl bg-[#faf8f5] border border-gray-100 p-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">How it works</p>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>· Click a date to select it</li>
                <li>· Click a second date to select a range</li>
                <li>· Choose a reason and click <strong>Block</strong></li>
                <li>· Click an <span className="text-orange-600">orange</span> date to remove the block</li>
                <li>· <span className="text-blue-600">Blue</span> dates are confirmed bookings — read-only</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
