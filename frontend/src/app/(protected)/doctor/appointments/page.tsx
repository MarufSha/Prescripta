"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  CalendarDays,
  Clock,
  Hash,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const DAYS_OF_WEEK = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

type Patient = { _id: string; name: string; email: string };
type TimeSlot = { startTime: string; endTime: string };
type Appointment = {
  _id: string;
  patient: Patient;
  day: string;
  timeSlot: TimeSlot;
  serialNumber: number;
  symptoms?: string;
  status: "pending" | "confirmed" | "cancelled";
};

// Group appointments by day → timeSlot key → sorted by serial
type SlotGroup = { slot: TimeSlot; appointments: Appointment[] };
type DayGroup  = { day: string; slots: SlotGroup[] };

function groupAppointments(appointments: Appointment[]): DayGroup[] {
  const byDay: Record<string, Record<string, Appointment[]>> = {};

  for (const appt of appointments) {
    const slotKey = `${appt.timeSlot.startTime}-${appt.timeSlot.endTime}`;
    if (!byDay[appt.day]) byDay[appt.day] = {};
    if (!byDay[appt.day][slotKey]) byDay[appt.day][slotKey] = [];
    byDay[appt.day][slotKey].push(appt);
  }

  return DAYS_OF_WEEK.filter((d) => byDay[d]).map((day) => ({
    day,
    slots: Object.entries(byDay[day])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slotKey, appts]) => ({
        slot: { startTime: slotKey.split("-")[0], endTime: slotKey.split("-")[1] },
        appointments: [...appts].sort((a, b) => a.serialNumber - b.serialNumber),
      })),
  }));
}

// ── Row ────────────────────────────────────────────────────────────────────────

function AppointmentRow({ appt, idx }: { appt: Appointment; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasSymptoms = !!appt.symptoms?.trim();

  return (
    <div className={`border-b last:border-b-0 border-gray-100 dark:border-gray-800 ${idx % 2 === 0 ? "" : "bg-gray-50/40 dark:bg-gray-800/20"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Serial badge */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {appt.serialNumber}
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {appt.patient.name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {appt.patient.email}
          </p>
        </div>

        {/* Expand symptoms toggle */}
        {hasSymptoms && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            Symptoms
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Expanded symptoms */}
      {expanded && hasSymptoms && (
        <div className="px-4 pb-3 pl-[3.25rem]">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2">
            {appt.symptoms}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Slot card ──────────────────────────────────────────────────────────────────

function SlotCard({ slot, appointments }: SlotGroup) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm overflow-hidden">
      {/* Slot header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 bg-emerald-500/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {slot.startTime} – {slot.endTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1">
          <Users className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            {appointments.length} patient{appointments.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Patient rows */}
      <div>
        {appointments.map((appt, i) => (
          <AppointmentRow key={appt._id} appt={appt} idx={i} />
        ))}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<{ appointments: Appointment[] }>(
          `${API_BASE_URL}/appointments/doctor`,
          { withCredentials: true },
        );
        setAppointments(res.data.appointments);
      } catch {
        setError("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const grouped = useMemo(() => groupAppointments(appointments), [appointments]);
  const totalPatients = appointments.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Patients booked with you, grouped by day and time slot
          </p>
        </div>
        {totalPatients > 0 && (
          <div className="shrink-0 flex items-center gap-2 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {totalPatients} total
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-36 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && grouped.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CalendarDays className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            No appointments yet
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Patients who book with you will appear here
          </p>
        </div>
      )}

      {/* Day → slot groups */}
      {!isLoading && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map(({ day, slots }) => (
            <div key={day}>
              {/* Day label */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {day}
                  </h2>
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {slots.reduce((n, s) => n + s.appointments.length, 0)} patient{slots.reduce((n, s) => n + s.appointments.length, 0) !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {slots.map((slotGroup) => (
                  <SlotCard
                    key={`${slotGroup.slot.startTime}-${slotGroup.slot.endTime}`}
                    {...slotGroup}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
