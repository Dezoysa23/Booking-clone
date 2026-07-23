"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { EVENT_CONFIG } from "@/components/SuperAdminCalendarWidget";
import type { CalendarEvent, CalendarEventType } from "@/app/api/super-admin/calendar/route";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    cells.push({ day: d, current: false, key: `${py}-${String(pm).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, key: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  const fill = 42 - cells.length;
  for (let d = 1; d <= fill; d++) {
    const nm = month === 12 ? 1 : month + 1;
    const ny = month === 12 ? year + 1 : year;
    cells.push({ day: d, current: false, key: `${ny}-${String(nm).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
  }
  return cells;
}

const ALL_TYPES = Object.keys(EVENT_CONFIG) as CalendarEventType[];

export default function CalendarView() {
  const localNow = new Date();
  const todayKey = localDateKey(localNow);

  const [year, setYear] = useState(localNow.getFullYear());
  const [month, setMonth] = useState(localNow.getMonth() + 1);
  const [days, setDays] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [activeFilters, setActiveFilters] = useState<CalendarEventType[]>([]);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/super-admin/calendar?year=${y}&month=${m}`);
      if (!res.ok) throw new Error();
      const data: { days: Record<string, CalendarEvent[]> } = await res.json();
      setDays(data.days ?? {});
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonth(year, month);
  }, [year, month, fetchMonth]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }
  function jumpToToday() {
    setYear(localNow.getFullYear());
    setMonth(localNow.getMonth() + 1);
    setSelectedKey(todayKey);
  }
  function toggleFilter(t: CalendarEventType) {
    setActiveFilters((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function filterEvents(events: CalendarEvent[]) {
    if (activeFilters.length === 0) return events;
    return events.filter((e) => activeFilters.includes(e.type));
  }

  const grid = buildGrid(year, month);
  const selectedEvents = filterEvents(days[selectedKey] ?? []);
  const totalEvents = Object.values(days).reduce((acc, arr) => acc + filterEvents(arr).length, 0);

  const selectedLabel = (() => {
    const [sy, sm, sd] = selectedKey.split("-").map(Number);
    return new Date(sy, sm - 1, sd).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
  })();

  return (
    <div className="space-y-6">
      {/* ── Top controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Month navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-gray-600 text-lg">chevron_left</span>
          </button>

          <div className="text-center min-w-[160px]">
            <h2 className="font-[family-name:var(--font-playfair-display)] text-xl font-semibold text-[#14213D]">
              {MONTHS[month - 1]} {year}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? "Loading…" : `${totalEvents} event${totalEvents !== 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-gray-600 text-lg">chevron_right</span>
          </button>

          <button
            onClick={jumpToToday}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#14213D] shadow-sm hover:bg-[#14213D]/5 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Event count summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_TYPES.map((type) => {
            const count = Object.values(days).flat().filter((e) => e.type === type).length;
            if (count === 0) return null;
            const cfg = EVENT_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border ${
                  activeFilters.includes(type)
                    ? "border-transparent shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
                style={
                  activeFilters.includes(type)
                    ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + "40" }
                    : { color: "#6b7280" }
                }
              >
                <span className="material-symbols-outlined text-xs">{cfg.icon}</span>
                {cfg.label}
                <span
                  className="font-bold rounded-full px-1 py-0.5 text-[10px] leading-none"
                  style={{ backgroundColor: activeFilters.includes(type) ? cfg.color + "20" : "#f3f4f6" }}
                >
                  {count}
                </span>
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button
              onClick={() => setActiveFilters([])}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Main grid + sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Calendar grid */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAY_HEADERS.map((d) => (
              <div key={d} className="px-2 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Cell grid */}
          {error ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-red-300 text-4xl">error_outline</span>
              <p className="mt-2 text-sm text-gray-500">Failed to load events.</p>
              <button onClick={() => fetchMonth(year, month)} className="mt-3 text-sm text-[#14213D] font-semibold hover:underline">
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
              {grid.map((cell, i) => {
                const rawEvents = days[cell.key] ?? [];
                const events = filterEvents(rawEvents);
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedKey;

                return (
                  <div
                    key={i}
                    onClick={() => cell.current && setSelectedKey(cell.key)}
                    className={`min-h-[90px] p-2 flex flex-col gap-1 transition-colors ${
                      cell.current ? "cursor-pointer hover:bg-[#14213D]/3" : "bg-gray-50/30"
                    } ${isSelected && cell.current ? "bg-[#14213D]/5 ring-2 ring-inset ring-[#14213D]/30" : ""}`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-end">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday
                            ? "bg-[#D9A94D] text-[#14213D]"
                            : isSelected && cell.current
                            ? "bg-[#14213D] text-white"
                            : cell.current
                            ? "text-gray-700"
                            : "text-gray-300"
                        }`}
                      >
                        {cell.day}
                      </span>
                    </div>

                    {/* Event pills */}
                    <div className="flex flex-col gap-0.5">
                      {events.slice(0, 3).map((event) => {
                        const cfg = EVENT_CONFIG[event.type];
                        return (
                          <div
                            key={event.id}
                            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium truncate"
                            style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            title={event.title}
                          >
                            <span
                              className="material-symbols-outlined shrink-0"
                              style={{ fontSize: "10px" }}
                            >
                              {cfg.icon}
                            </span>
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {events.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-medium pl-1">
                          +{events.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sidebar: selected day events ── */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-br from-[#14213D] to-[#16233F]">
            <p className="text-[#D9A94D] text-[10px] font-bold uppercase tracking-widest mb-0.5">
              {selectedKey === todayKey ? "Today" : "Selected Day"}
            </p>
            <h3 className="font-[family-name:var(--font-playfair-display)] text-white text-base font-semibold leading-tight">
              {selectedLabel}
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                <span className="material-symbols-outlined text-gray-200 text-4xl">event_available</span>
                <p className="mt-2 text-sm text-gray-400">No events on this date.</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {selectedEvents.map((event) => {
                  const cfg = EVENT_CONFIG[event.type];
                  const eventDate = new Date(event.date);
                  const timeStr = eventDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl p-3 border"
                      style={{ backgroundColor: cfg.bg, borderColor: cfg.color + "30" }}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ backgroundColor: cfg.color + "20" }}
                        >
                          <span
                            className="material-symbols-outlined text-base"
                            style={{ color: cfg.color }}
                          >
                            {cfg.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: cfg.color + "15", color: cfg.color }}
                            >
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-gray-400">{timeStr}</span>
                            {event.bookingId && (
                              <Link
                                href={`/admin/bookings`}
                                className="text-[10px] text-[#14213D] hover:underline font-medium"
                              >
                                #B{event.bookingId}
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#14213D] hover:text-[#16233F] transition-colors"
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Legend</p>
        <div className="flex flex-wrap gap-3">
          {ALL_TYPES.map((type) => {
            const cfg = EVENT_CONFIG[type];
            return (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "12px", color: cfg.color }}
                  >
                    {cfg.icon}
                  </span>
                </span>
                <span className="text-xs text-gray-600">{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
