"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore, type PublicDoctor } from "@/store/authStore";
import { createPortal } from "react-dom";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  CalendarPlus,
  X,
  CheckCircle2,
  Hash,
  CalendarCheck,
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAYS_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

type TimeSlot = { startTime: string; endTime: string };
type SelectedSlot = { day: string; timeSlot: TimeSlot };

// ── Booking Modal ──────────────────────────────────────────────────────────────

function BookingModal({
  doctor,
  onClose,
}: {
  doctor: PublicDoctor;
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<SelectedSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState<number | null>(null);

  const p = doctor.doctorProfile;

  const byDay = DAYS_OF_WEEK.reduce<Record<string, TimeSlot[]>>((acc, day) => {
    const slots = p?.availability?.filter((a) => a.day === day) ?? [];
    if (slots.length > 0) acc[day] = slots.map(({ startTime, endTime }) => ({ startTime, endTime }));
    return acc;
  }, {});

  const availableDays = DAYS_OF_WEEK.filter((d) => byDay[d]);

  const handleBook = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const csrfRes = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
        withCredentials: true,
      });
      const csrfToken = String(csrfRes.data?.csrfToken ?? "");

      const res = await axios.post<{ success: boolean; serialNumber: number }>(
        `${API_BASE_URL}/appointments`,
        { doctorId: doctor._id, day: selected.day, timeSlot: selected.timeSlot },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
      );
      setSerialNumber(res.data.serialNumber);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message as string ?? "Failed to book appointment");
      } else {
        setError("Failed to book appointment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="flex flex-col w-full sm:w-[min(520px,calc(100%-2rem))] max-h-[92dvh] rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-950 border-0 sm:border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
              {!!p?.specialties?.length && (
                <p className="text-xs text-blue-600 dark:text-blue-400">{p.specialties.join(" · ")}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Success state */}
        {serialNumber !== null ? (
          <div className="flex flex-col items-center justify-center gap-4 p-8 text-center flex-1">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Appointment Booked!</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your appointment with <span className="font-semibold text-gray-700 dark:text-gray-300">{doctor.name}</span> on{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">{selected?.day}</span> ({selected?.timeSlot.startTime}–{selected?.timeSlot.endTime}) has been confirmed.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-5 py-3">
              <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">Your Serial Number</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{serialNumber}</p>
              </div>
              <p className="text-xs text-blue-500 dark:text-blue-400 ml-2">
                {serialNumber === 1
                  ? "You are first in queue"
                  : `${serialNumber - 1} patient${serialNumber - 1 > 1 ? "s" : ""} before you`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/patient/appointments")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 cursor-pointer"
            >
              <CalendarCheck className="h-4 w-4" />
              View My Appointments
            </button>
          </div>
        ) : (
          <>
            {/* Slot selection */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a day and time slot for your appointment.
              </p>

              {availableDays.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                  This doctor has no availability set yet.
                </div>
              ) : (
                availableDays.map((day) => (
                  <div key={day}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      {day}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {byDay[day].map((slot) => {
                        const slotKey = `${day}-${slot.startTime}-${slot.endTime}`;
                        const isActive =
                          selected?.day === day &&
                          selected.timeSlot.startTime === slot.startTime &&
                          selected.timeSlot.endTime === slot.endTime;
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            onClick={() =>
                              setSelected({ day, timeSlot: slot })
                            }
                            className={[
                              "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-all cursor-pointer",
                              isActive
                                ? "border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400",
                            ].join(" ")}
                          >
                            <Clock className="h-3.5 w-3.5" />
                            {slot.startTime} – {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}

              {error && (
                <p className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 px-5 py-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleBook()}
                disabled={!selected || isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <CalendarPlus className="h-4 w-4" />
                {isSubmitting ? "Booking…" : "Confirm Booking"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

// ── Doctor Card ────────────────────────────────────────────────────────────────

function DoctorCard({
  doctor,
  onBook,
}: {
  doctor: PublicDoctor;
  onBook: () => void;
}) {
  const p = doctor.doctorProfile;
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const byDay = DAYS_OF_WEEK.reduce<Record<string, TimeSlot[]>>((acc, day) => {
    const slots = p?.availability?.filter((a) => a.day === day) ?? [];
    if (slots.length > 0) acc[day] = slots;
    return acc;
  }, {});

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

        {Object.keys(byDay).length > 0 && (
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {DAYS_OF_WEEK.filter((d) => byDay[d]).flatMap((day) =>
                byDay[day].map((slot) => (
                  <span
                    key={`${day}-${slot.startTime}`}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-300"
                  >
                    {DAYS_SHORT[day] ?? day} {slot.startTime}–{slot.endTime}
                  </span>
                )),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4">
        <button
          type="button"
          onClick={onBook}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md active:scale-95 cursor-pointer"
        >
          <CalendarPlus className="h-4 w-4" />
          Book Appointment
        </button>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function BookAppointmentPage() {
  const { doctors, fetchDoctors, isLoading, error } = useAuthStore();
  const [bookingDoctor, setBookingDoctor] = useState<PublicDoctor | null>(null);

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
            <DoctorCard
              key={doctor._id}
              doctor={doctor}
              onBook={() => setBookingDoctor(doctor)}
            />
          ))}
        </div>
      )}

      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
        />
      )}
    </motion.div>
  );
}
