"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  User,
  Pill,
  Stethoscope,
  Lightbulb,
  FlaskConical,
  CalendarClock,
} from "lucide-react";

interface Medication {
  medicine: string;
  days: string;
  timesPerDay: string;
  timing: string;
}

interface Prescription {
  _id: string;
  patientName: string;
  age: number;
  sex: string;
  date: string;
  chiefComplaints: string[];
  diagnosis: string[];
  medications: Medication[];
  investigations: string[];
  advice: string[];
  followUpDays: number | null;
  appointmentSlot: { day: string; startTime: string; endTime: string };
  doctorId: {
    _id: string;
    name: string;
    doctorProfile?: {
      specialties?: string[];
      designation?: string;
    };
  };
  createdAt: string;
}

function fmt12(t: string) {
  if (!t) return t;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function PrescriptionCard({ rx }: { rx: Prescription }) {
  const [expanded, setExpanded] = useState(false);

  const hasSlot =
    rx.appointmentSlot?.day && rx.appointmentSlot?.startTime;

  const doctorName = rx.doctorId?.name ?? "Unknown Doctor";
  const specialties = rx.doctorId?.doctorProfile?.specialties ?? [];
  const designation = rx.doctorId?.doctorProfile?.designation ?? "";

  const displayDate = new Date(rx.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900/70 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex items-center gap-3 min-w-0">
          {/* Doctor avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-sm uppercase">
            {doctorName
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {doctorName}
            </p>
            {(designation || specialties.length > 0) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {[designation, ...specialties].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {displayDate}
          </span>
          {hasSlot && (
            <span className="flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-blue-600 dark:text-blue-400 font-medium">
              <Clock className="h-3.5 w-3.5" />
              {rx.appointmentSlot.day} · {fmt12(rx.appointmentSlot.startTime)}
              {rx.appointmentSlot.endTime
                ? ` – ${fmt12(rx.appointmentSlot.endTime)}`
                : ""}
            </span>
          )}
        </div>
      </div>

      {/* Chief complaints summary */}
      {rx.chiefComplaints.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
            Chief Complaints
          </p>
          <div className="flex flex-wrap gap-1.5">
            {rx.chiefComplaints.map((c) => (
              <span
                key={c}
                className="rounded-full bg-orange-50 dark:bg-orange-900/20 px-2.5 py-0.5 text-xs text-orange-700 dark:text-orange-300"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expand / collapse */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 dark:border-gray-800 py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3.5 w-3.5" />
            Hide details
          </>
        ) : (
          <>
            <ChevronDown className="h-3.5 w-3.5" />
            View full prescription
          </>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-4">
              {/* Patient vitals row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  {rx.age} yrs · {rx.sex}
                </span>
              </div>

              {/* Diagnosis */}
              {rx.diagnosis.length > 0 && (
                <Section
                  icon={<Stethoscope className="h-3.5 w-3.5" />}
                  title="Diagnosis"
                >
                  <ul className="list-disc list-inside space-y-0.5">
                    {rx.diagnosis.map((d) => (
                      <li key={d} className="text-sm text-gray-700 dark:text-gray-300">
                        {d}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Medications */}
              {rx.medications.length > 0 && (
                <Section
                  icon={<Pill className="h-3.5 w-3.5" />}
                  title="Medications"
                >
                  <div className="space-y-2">
                    {rx.medications.map((med, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-3 py-2"
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {med.medicine}
                        </p>
                        {(med.days || med.timesPerDay || med.timing) && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {[
                              med.days && `${med.days} day${Number(med.days) !== 1 ? "s" : ""}`,
                              med.timesPerDay && `${med.timesPerDay}× per day`,
                              med.timing,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Investigations */}
              {rx.investigations.length > 0 && (
                <Section
                  icon={<FlaskConical className="h-3.5 w-3.5" />}
                  title="Investigations"
                >
                  <ul className="list-disc list-inside space-y-0.5">
                    {rx.investigations.map((inv) => (
                      <li key={inv} className="text-sm text-gray-700 dark:text-gray-300">
                        {inv}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Advice */}
              {rx.advice.length > 0 && (
                <Section
                  icon={<Lightbulb className="h-3.5 w-3.5" />}
                  title="Advice"
                >
                  <ul className="list-disc list-inside space-y-0.5">
                    {rx.advice.map((a) => (
                      <li key={a} className="text-sm text-gray-700 dark:text-gray-300">
                        {a}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Follow-up */}
              {rx.followUpDays && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                  <CalendarClock className="h-4 w-4 shrink-0" />
                  Follow up in <strong>{rx.followUpDays} day{rx.followUpDays !== 1 ? "s" : ""}</strong>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ success: boolean; message?: string; prescriptions: Prescription[] }>(
          `${API_BASE_URL}/auth/my-prescriptions`,
          { withCredentials: true },
        );
        if (!res.data.success) throw new Error(res.data.message ?? "Failed to load");
        setPrescriptions(res.data.prescriptions ?? []);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message ?? e.message)
          : e instanceof Error ? e.message : "Failed to load prescriptions";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Prescriptions issued by your doctors
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && prescriptions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <ClipboardList className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            No prescriptions yet
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Prescriptions from your doctor visits will appear here
          </p>
        </div>
      )}

      {!loading && !error && prescriptions.length > 0 && (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx._id} rx={rx} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
