"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CalendarEventType, CalendarEvent } from "@/app/api/super-admin/calendar/route";

// ─── Event config ──────────────────────────────────────────────────────────────

export const EVENT_CONFIG: Record<
  CalendarEventType,
  { label: string; color: string; bg: string; icon: string }
> = {
  BOOKING_CREATED:        { label: "New Booking",         color: "#1e40af", bg: "#dbeafe", icon: "calendar_add_on" },
  BOOKING_CANCELLED:      { label: "Cancelled",           color: "#dc2626", bg: "#fee2e2", icon: "event_busy" },
  CHECK_IN:               { label: "Check-in",            color: "#059669", bg: "#d1fae5", icon: "login" },
  CHECK_OUT:              { label: "Check-out",           color: "#c4922f", bg: "#fef3c7", icon: "logout" },
  PAYMENT_PAID:           { label: "Payment Received",    color: "#16a34a", bg: "#dcfce7", icon: "payments" },
  PAYMENT_FAILED:         { label: "Payment Failed",      color: "#dc2626", bg: "#fee2e2", icon: "money_off" },
  SUBSCRIPTION_RENEWAL:   { label: "Sub Renewal",         color: "#7c3aed", bg: "#ede9fe", icon: "autorenew" },
  SUBSCRIPTION_CANCELLED: { label: "Sub Cancelled",       color: "#ea580c", bg: "#ffedd5", icon: "cancel" },
  PROPERTY_CREATED:       { label: "New Property",        color: "#0284c7", bg: "#e0f2fe", icon: "apartment" },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

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
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    cells.push({
      day: d,
      current: false,
      key: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      current: true,
      key: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  const fill = 42 - cells.length;
  for (let d = 1; d <= fill; d++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    cells.push({
      day: d,
      current: false,
      key: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    });
  }
  return cells;
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function SuperAdminCalendarWidget() {
  const localNow = new Date();
  const todayKey = localDateKey(localNow);

  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(localNow.getFullYear());
  const [month, setMonth] = useState(localNow.getMonth() + 1);
  const [days, setDays] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [selectedKey, setSelectedKey] = useState(todayKey);
  const [todayCount, setTodayCount] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // ── Fetch calendar data
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

  // Initial badge count — fetch current month once
  useEffect(() => {
    const y = localNow.getFullYear();
    const m = localNow.getMonth() + 1;
    fetch(`/api/super-admin/calendar?year=${y}&month=${m}`)
      .then((r) => r.json())
      .then((data) => {
        const allDays: Record<string, CalendarEvent[]> = data.days ?? {};
        // count events whose UTC date matches today locally
        let count = 0;
        for (const [k, evts] of Object.entries(allDays)) {
          if (k === todayKey) count += evts.length;
        }
        setTodayCount(count);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch whenever month/year changes and panel is open
  useEffect(() => {
    if (open) fetchMonth(year, month);
  }, [open, year, month, fetchMonth]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

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

  const grid = buildGrid(year, month);
  const totalEvents = Object.values(days).reduce((acc, arr) => acc + arr.length, 0);
  const selectedEvents = days[selectedKey] ?? [];

  const selectedLabel = (() => {
    const [sy, sm, sd] = selectedKey.split("-").map(Number);
    return new Date(sy, sm - 1, sd).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  })();

  return (
    <div ref={wrapperRef} className="relative">
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open admin calendar"
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-all duration-150 ${
          open ? "bg-white/20 shadow-inner" : "bg-white/8 hover:bg-white/15"
        }`}
      >
        <span className="material-symbols-outlined text-[#d9a94d] text-lg leading-none">calendar_month</span>
        <span className="hidden md:flex items-center gap-1.5 text-white/75 text-xs font-medium">
          <span>{MONTHS[localNow.getMonth()].slice(0, 3)}</span>
          <span className="font-bold text-white">{localNow.getDate()}</span>
        </span>
        {todayCount > 0 && (
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d9a94d] text-[#14213d] text-[10px] font-bold px-1 leading-none">
            {todayCount > 9 ? "9+" : todayCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute top-[calc(100%+10px)] left-0 z-[200] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-[0_8px_40px_rgba(7,27,99,0.18)] border border-slate-100 overflow-hidden"
          style={{ animation: "fadeSlideDown 0.15s ease-out" }}
        >
          {/* Panel header */}
          <div className="bg-linear-to-br from-[#14213d] to-[#1a3a6b] px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <button
                onClick={prevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 transition-colors text-white"
                aria-label="Previous month"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>

              <div className="text-center">
                <p className="font-(family-name:--font-playfair-display) text-white font-semibold text-sm tracking-wide">
                  {MONTHS[month - 1]} {year}
                </p>
                <p className="text-[#d9a94d] text-[11px] mt-0.5">
                  {loading ? "Loading…" : `${totalEvents} event${totalEvents !== 1 ? "s" : ""} this month`}
                </p>
              </div>

              <button
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/15 transition-colors text-white"
                aria-label="Next month"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="p-3 pb-1">
            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1 uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {grid.map((cell, i) => {
                if (!cell.current) {
                  return (
                    <div
                      key={i}
                      className="h-9 flex items-center justify-center"
                    >
                      <span className="text-[11px] text-slate-200">{cell.day}</span>
                    </div>
                  );
                }

                const events = days[cell.key] ?? [];
                const isToday = cell.key === todayKey;
                const isSelected = cell.key === selectedKey;
                const dotColors = [
                  ...new Set(events.map((e) => EVENT_CONFIG[e.type].color)),
                ].slice(0, 3);

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedKey(cell.key)}
                    className={`relative h-9 w-full flex flex-col items-center justify-center rounded-lg transition-all duration-100 ${
                      isSelected
                        ? "bg-[#14213d] shadow-md"
                        : isToday
                        ? "ring-2 ring-[#d9a94d] ring-offset-1 font-bold"
                        : "hover:bg-[#14213d]/6"
                    }`}
                  >
                    <span
                      className={`text-xs font-medium leading-none ${
                        isSelected ? "text-white" : isToday ? "text-[#14213d]" : "text-slate-700"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dotColors.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {dotColors.map((color, ci) => (
                          <span
                            key={ci}
                            className="h-1 w-1 rounded-full"
                            style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.7)" : color }}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day events */}
          <div className="mt-1 border-t border-slate-100">
            <div className="flex items-center justify-between px-4 py-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedKey === todayKey ? "Today" : selectedLabel}
              </p>
              {selectedEvents.length > 0 && (
                <span className="text-[11px] font-bold text-[#14213d] bg-[#14213d]/8 px-2 py-0.5 rounded-full">
                  {selectedEvents.length}
                </span>
              )}
            </div>

            {error ? (
              <p className="px-4 pb-4 text-xs text-rose-500">Failed to load events.</p>
            ) : (
              <div className="max-h-[160px] overflow-y-auto px-3 pb-3 space-y-1.5">
                {selectedEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-1">No events on this date.</p>
                ) : (
                  selectedEvents.map((event) => {
                    const cfg = EVENT_CONFIG[event.type];
                    const eventDate = new Date(event.date);
                    const timeStr = eventDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <div
                        key={event.id}
                        className="flex items-start gap-2.5 rounded-lg px-2.5 py-2"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <span
                          className="material-symbols-outlined text-base shrink-0 mt-0.5"
                          style={{ color: cfg.color }}
                        >
                          {cfg.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-snug truncate">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-xs text-slate-500 truncate">{event.description}</p>
                          )}
                          <p className="text-[10px] font-medium mt-0.5" style={{ color: cfg.color }}>
                            {cfg.label} · {timeStr}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/80">
            <button
              type="button"
              onClick={jumpToToday}
              className="text-xs font-semibold text-[#14213d] hover:underline"
            >
              Today
            </button>
            <Link
              href="/admin/calendar"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 text-xs font-semibold text-[#14213d] hover:text-[#14213d] transition-colors"
            >
              Full calendar
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
