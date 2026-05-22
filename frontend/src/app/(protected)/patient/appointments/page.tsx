"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  Hash,
  Stethoscope,
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

type AppointmentTimeSlot = { startTime: string; endTime: string };
type Appointment = {
  _id: string;
  doctor: {
    _id: string;
    name: string;
    doctorProfile?: { specialties?: string[] };
  };
  day: string;
  timeSlot: AppointmentTimeSlot;
  serialNumber: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

const statusStyle: Record<string, string> = {
  pending:
    "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  confirmed:
    "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled:
    "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
};

function AppointmentCard({ appt }: { appt: Appointment }) {
  const initials = appt.doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {appt.doctor.name}
          </p>
          {!!appt.doctor.doctorProfile?.specialties?.length && (
            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {appt.doctor.doctorProfile.specialties.join(" · ")}
            </p>
          )}
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[appt.status]}`}
        >
          {appt.status}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CalendarCheck className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="font-medium text-gray-900 dark:text-white">{appt.day}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4 text-blue-500 shrink-0" />
          <span>
            {appt.timeSlot.startTime} – {appt.timeSlot.endTime}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-indigo-500 shrink-0" />
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            Serial #{appt.serialNumber}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            ({appt.serialNumber === 1
              ? "first in queue"
              : `${appt.serialNumber - 1} before you`})
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get<{ appointments: Appointment[] }>(
          `${API_BASE_URL}/appointments/my`,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View your upcoming and past appointments
          </p>
        </div>
        <Link
          href="/patient/appointments/book"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
        >
          <CalendarPlus className="h-4 w-4" />
          Book
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50"
            />
          ))}
        </div>
      )}

      {!isLoading && appointments.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
            <Stethoscope className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No appointments yet
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Book your first appointment to get started
          </p>
          <Link
            href="/patient/appointments/book"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            <CalendarPlus className="h-4 w-4" />
            Book an Appointment
          </Link>
        </div>
      )}

      {!isLoading && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <AppointmentCard key={appt._id} appt={appt} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
