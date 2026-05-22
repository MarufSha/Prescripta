"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore, type PublicDoctor } from "@/store/authStore";
import {
  Stethoscope,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  CalendarPlus,
} from "lucide-react";

const DAYS_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function DoctorCard({ doctor }: { doctor: PublicDoctor }) {
  const p = doctor.doctorProfile;
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm backdrop-blur-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-100 dark:border-gray-800 p-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow">
          {initials}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {doctor.name}
          </h3>
          {!!p?.specialties?.length && (
            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
              {p.specialties.join(" · ")}
            </p>
          )}
          {!!p?.designations?.length && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {p.designations[0]}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        {!!p?.degrees?.length && (
          <div className="flex items-start gap-2">
            <GraduationCap className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-gray-400">{p.degrees.join(", ")}</p>
          </div>
        )}

        {!!p?.mobileNumber && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-indigo-500" />
            <p className="text-xs text-gray-600 dark:text-gray-400">{p.mobileNumber}</p>
          </div>
        )}

        {!!p?.chambers?.length && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="space-y-0.5">
              {p.chambers.slice(0, 2).map((c, i) => (
                <p key={i} className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-800 dark:text-gray-300">{c.name}</span>
                  {" — "}
                  {c.location}
                </p>
              ))}
            </div>
          </div>
        )}

        {!!p?.availability?.length && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {p.availability.map((a) => (
                <span
                  key={a.day}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300"
                >
                  {DAYS_SHORT[a.day] ?? a.day} {a.startTime}–{a.endTime}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
}

export default function BookAppointmentPage() {
  const { doctors, fetchDoctors, isLoading, error } = useAuthStore();

  useEffect(() => {
    void fetchDoctors();
  }, [fetchDoctors]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book an Appointment</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Browse available doctors and schedule your visit
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50"
            />
          ))}
        </div>
      )}

      {!isLoading && doctors.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <Stethoscope className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No doctors available
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Please check back later
          </p>
        </div>
      )}

      {!isLoading && doctors.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
