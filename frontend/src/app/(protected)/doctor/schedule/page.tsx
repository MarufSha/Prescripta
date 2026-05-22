"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Clock, CalendarDays, Settings } from "lucide-react";

const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

export default function SchedulePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const availability = user?.doctorProfile?.availability ?? [];

  const availabilityMap = Object.fromEntries(availability.map((a) => [a.day, a]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Your weekly availability for patient appointments
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/doctor/settings#edit-doctor-info")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all hover:border-emerald-500/30 hover:text-gray-900 dark:hover:text-white cursor-pointer"
        >
          <Settings className="h-4 w-4 text-emerald-500" />
          Edit Schedule
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm backdrop-blur-xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <CalendarDays className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Availability</h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {DAYS_OF_WEEK.map((day) => {
            const slot = availabilityMap[day];
            return (
              <div
                key={day}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  slot ? "" : "opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      slot ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{day}</span>
                </div>
                {slot ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span>
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">Not available</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {availability.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Clock className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
            No schedule set
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your weekly availability in Settings so patients can book appointments
          </p>
          <button
            type="button"
            onClick={() => router.push("/doctor/settings")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            Go to Settings
          </button>
        </div>
      )}
    </motion.div>
  );
}
