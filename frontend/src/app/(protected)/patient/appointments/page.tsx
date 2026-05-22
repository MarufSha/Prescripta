"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CalendarCheck, CalendarPlus } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View your past and upcoming appointments
          </p>
        </div>
        <Link
          href="/patient/appointments/book"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95"
        >
          <CalendarPlus className="h-4 w-4" />
          Book Appointment
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10">
          <CalendarCheck className="h-8 w-8 text-indigo-500" />
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
    </motion.div>
  );
}
