"use client";

import { Plus, X, Clock } from "lucide-react";

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type TimeSlot = { startTime: string; endTime: string };
export type DaySchedule = { day: string; enabled: boolean; slots: TimeSlot[] };

// ── Conversions ────────────────────────────────────────────────────────────────

export function initDaySchedules(): DaySchedule[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    enabled: false,
    slots: [{ startTime: "09:00", endTime: "17:00" }],
  }));
}

export function toDaySchedules(
  availability: { day: string; startTime: string; endTime: string }[],
): DaySchedule[] {
  return DAYS_OF_WEEK.map((day) => {
    const daySlots = availability.filter((a) => a.day === day);
    return {
      day,
      enabled: daySlots.length > 0,
      slots:
        daySlots.length > 0
          ? daySlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime }))
          : [{ startTime: "09:00", endTime: "17:00" }],
    };
  });
}

export function fromDaySchedules(
  schedules: DaySchedule[],
): { day: string; startTime: string; endTime: string }[] {
  return schedules
    .filter((s) => s.enabled)
    .flatMap((s) =>
      s.slots.map((slot) => ({
        day: s.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    );
}

// ── Props ──────────────────────────────────────────────────────────────────────

type Props = {
  value: DaySchedule[];
  onChange: (v: DaySchedule[]) => void;
  /** Force dark background styling (admin modal, invite form). Defaults to auto via Tailwind dark: */
  forceDark?: boolean;
};

// ── Toggle switch ──────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  forceDark,
}: {
  checked: boolean;
  onChange: () => void;
  forceDark?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        checked
          ? "bg-emerald-500"
          : forceDark
            ? "bg-gray-700"
            : "bg-gray-300 dark:bg-gray-700",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

// ── Time input ─────────────────────────────────────────────────────────────────

function TimeInput({
  value,
  onChange,
  forceDark,
}: {
  value: string;
  onChange: (v: string) => void;
  forceDark?: boolean;
}) {
  const base = forceDark
    ? "border-gray-700 bg-gray-900/80 text-white focus:border-emerald-500 focus:ring-emerald-500/20"
    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500/50";
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border px-2.5 py-1.5 text-sm outline-none focus:ring-2 transition-colors ${base}`}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AvailabilityScheduler({ value, onChange, forceDark }: Props) {
  const toggleDay = (dayIdx: number) => {
    onChange(
      value.map((d, i) => (i === dayIdx ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const addSlot = (dayIdx: number) => {
    onChange(
      value.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: [...d.slots, { startTime: "09:00", endTime: "17:00" }] }
          : d,
      ),
    );
  };

  const removeSlot = (dayIdx: number, slotIdx: number) => {
    if (value[dayIdx].slots.length === 1) return;
    onChange(
      value.map((d, i) =>
        i === dayIdx
          ? { ...d, slots: d.slots.filter((_, si) => si !== slotIdx) }
          : d,
      ),
    );
  };

  const updateSlot = (
    dayIdx: number,
    slotIdx: number,
    field: "startTime" | "endTime",
    val: string,
  ) => {
    onChange(
      value.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              slots: d.slots.map((s, si) =>
                si === slotIdx ? { ...s, [field]: val } : s,
              ),
            }
          : d,
      ),
    );
  };

  const rowBg = forceDark
    ? "border-gray-800 bg-gray-900/60"
    : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50";

  const labelColor = (enabled: boolean) =>
    enabled
      ? forceDark
        ? "text-white"
        : "text-gray-900 dark:text-white"
      : forceDark
        ? "text-gray-500"
        : "text-gray-400 dark:text-gray-500";

  const unavailableText = forceDark ? "text-gray-600" : "text-gray-400 dark:text-gray-600";
  const addSlotColor = forceDark
    ? "text-emerald-400 hover:text-emerald-300"
    : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300";
  const removeSlotColor = forceDark
    ? "text-gray-600 hover:text-red-400"
    : "text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400";

  return (
    <div className="space-y-1.5">
      {value.map((day, dayIdx) => (
        <div
          key={day.day}
          className={`rounded-xl border ${rowBg} transition-all duration-150`}
        >
          {/* Day header row */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Toggle
              checked={day.enabled}
              onChange={() => toggleDay(dayIdx)}
              forceDark={forceDark}
            />
            <span className={`w-24 text-sm font-semibold select-none ${labelColor(day.enabled)}`}>
              {day.day}
            </span>

            {day.enabled ? (
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {day.slots.map((slot, slotIdx) => (
                  <div key={slotIdx} className="flex items-center gap-1.5">
                    <TimeInput
                      value={slot.startTime}
                      onChange={(v) => updateSlot(dayIdx, slotIdx, "startTime", v)}
                      forceDark={forceDark}
                    />
                    <Clock
                      className={`h-3.5 w-3.5 shrink-0 ${forceDark ? "text-gray-600" : "text-gray-400 dark:text-gray-600"}`}
                    />
                    <TimeInput
                      value={slot.endTime}
                      onChange={(v) => updateSlot(dayIdx, slotIdx, "endTime", v)}
                      forceDark={forceDark}
                    />
                    {day.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(dayIdx, slotIdx)}
                        className={`transition-colors cursor-pointer ${removeSlotColor}`}
                        aria-label="Remove slot"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addSlot(dayIdx)}
                  className={`inline-flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer ${addSlotColor}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add slot
                </button>
              </div>
            ) : (
              <span className={`text-xs ${unavailableText}`}>Unavailable</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
