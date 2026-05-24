"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Pill,
  Stethoscope,
  Lightbulb,
  FlaskConical,
  CalendarClock,
  Download,
  User,
} from "lucide-react";
import {
  PrescriptionTemplate,
  PRESCRIPTION_TEMPLATE_ID,
} from "@/components/prescription/PrescriptionTemplate";
import { generatePrescriptionPdfFromElement } from "@/lib/pdf";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Medication {
  medicine: string;
  days: string;
  timesPerDay: string;
  timing: string;
}

interface DoctorProfile {
  specialties?: string[];
  designation?: string;
  designations?: string[];
  degrees?: string[];
  bmdcNo?: string;
  chambers?: { name?: string; location?: string }[];
  mobileNumber?: string;
}

interface Prescription {
  _id: string;
  patientName: string;
  age: number;
  sex: string;
  mobile: string;
  weight?: number | null;
  pulse?: string;
  bp?: string;
  spo2?: string;
  date: string;
  patientUid?: string;
  visitNumber?: number;
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
    doctorProfile?: DoctorProfile;
  };
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt12(t: string) {
  if (!t) return t;
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ── Section component ──────────────────────────────────────────────────────────

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
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Prescription card ──────────────────────────────────────────────────────────

function PrescriptionCard({
  rx,
  onDownload,
  isDownloading,
}: {
  rx: Prescription;
  onDownload: (rx: Prescription) => void;
  isDownloading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const hasSlot = rx.appointmentSlot?.day && rx.appointmentSlot?.startTime;
  const profile = rx.doctorId?.doctorProfile;
  const doctorName = rx.doctorId?.name ?? "Unknown Doctor";
  const specialties = profile?.specialties ?? [];
  const designation = profile?.designations?.[0] ?? profile?.designation ?? "";

  const displayDate = new Date(rx.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900/70 overflow-hidden shadow-sm"
    >
      {/* ── Card Header ── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Doctor info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold text-sm">
              {initials(doctorName)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate text-[15px]">
                {doctorName}
              </p>
              {(designation || specialties.length > 0) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {[designation, ...specialties].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={() => onDownload(rx)}
            disabled={isDownloading}
            className="shrink-0 flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {isDownloading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isDownloading ? "Generating…" : "Download"}
          </button>
        </div>

        {/* Date + slot badge row */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="h-3.5 w-3.5" />
            {displayDate}
          </span>
          {hasSlot && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/20 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <Clock className="h-3 w-3" />
              {rx.appointmentSlot.day} · {fmt12(rx.appointmentSlot.startTime)}
              {rx.appointmentSlot.endTime
                ? ` – ${fmt12(rx.appointmentSlot.endTime)}`
                : ""}
            </span>
          )}
        </div>

        {/* Chief complaints */}
        {rx.chiefComplaints.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
              Chief Complaints
            </p>
            <div className="flex flex-wrap gap-1.5">
              {rx.chiefComplaints.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-500/20 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Expand toggle ── */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-gray-100 dark:border-gray-800 py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
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

      {/* ── Expanded details ── */}
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
            <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-5">
              {/* Patient summary */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <User className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <span>
                  {rx.age} yrs · {rx.sex}
                </span>
              </div>

              {/* Diagnosis */}
              {rx.diagnosis.length > 0 && (
                <Section icon={<Stethoscope className="h-3.5 w-3.5" />} title="Diagnosis">
                  <ul className="space-y-1">
                    {rx.diagnosis.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Medications */}
              {rx.medications.length > 0 && (
                <Section icon={<Pill className="h-3.5 w-3.5" />} title="Medications">
                  <div className="space-y-2">
                    {rx.medications.map((med, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 px-3 py-2.5"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {med.medicine}
                          </p>
                          {(med.days || med.timesPerDay || med.timing) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {[
                                med.days &&
                                  `${med.days} day${Number(med.days) !== 1 ? "s" : ""}`,
                                med.timesPerDay && `${med.timesPerDay}× daily`,
                                med.timing,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Investigations */}
              {rx.investigations.length > 0 && (
                <Section icon={<FlaskConical className="h-3.5 w-3.5" />} title="Investigations">
                  <ul className="space-y-1">
                    {rx.investigations.map((inv) => (
                      <li
                        key={inv}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        {inv}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Advice */}
              {rx.advice.length > 0 && (
                <Section icon={<Lightbulb className="h-3.5 w-3.5" />} title="Advice">
                  <ul className="space-y-1">
                    {rx.advice.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Follow-up */}
              {rx.followUpDays != null && rx.followUpDays > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-500/20 px-3 py-2.5">
                  <CalendarClock className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Follow up in{" "}
                    <strong>
                      {rx.followUpDays} day{rx.followUpDays !== 1 ? "s" : ""}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF state — null = idle, string = id of prescription being captured
  const [pdfCapturing, setPdfCapturing] = useState<string | null>(null);
  const [pdfRx, setPdfRx] = useState<Prescription | null>(null);
  const pdfMountedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{
          success: boolean;
          message?: string;
          prescriptions: Prescription[];
        }>(`${API_BASE_URL}/auth/my-prescriptions`, { withCredentials: true });
        if (!res.data.success) throw new Error(res.data.message ?? "Failed to load");
        setPrescriptions(res.data.prescriptions ?? []);
      } catch (e: unknown) {
        const msg = axios.isAxiosError(e)
          ? ((e.response?.data as { message?: string })?.message ?? e.message)
          : e instanceof Error
          ? e.message
          : "Failed to load prescriptions";
        setError(msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = async (rx: Prescription) => {
    setPdfCapturing(rx._id);
    setPdfRx(rx);

    await new Promise<void>((resolve) => {
      pdfMountedRef.current = resolve;
    });

    try {
      const bytes = await generatePrescriptionPdfFromElement(PRESCRIPTION_TEMPLATE_ID);
      const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prescription-${rx.patientName.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfCapturing(null);
      setPdfRx(null);
    }
  };

  // Build PdfDoctorData from populated doctorId
  const pdfDoctor = pdfRx
    ? (() => {
        const p = pdfRx.doctorId?.doctorProfile;
        return {
          name: pdfRx.doctorId?.name ?? "",
          degrees: p?.degrees ?? [],
          designation: p?.designations?.[0] ?? p?.designation ?? "",
          bmdcNo: p?.bmdcNo ?? "",
          chamberName: p?.chambers?.[0]?.name ?? "",
          chamberAddress: p?.chambers?.[0]?.location ?? "",
          mobile: p?.mobileNumber ?? "",
        };
      })()
    : null;

  const pdfData = pdfRx
    ? {
        name: pdfRx.patientName,
        age: pdfRx.age,
        sex: pdfRx.sex,
        mobile: pdfRx.mobile,
        weight: pdfRx.weight ?? undefined,
        pulse: pdfRx.pulse,
        bp: pdfRx.bp,
        sp02: pdfRx.spo2,
        date: pdfRx.date,
        cc: pdfRx.chiefComplaints,
        dx: pdfRx.diagnosis,
        rx: pdfRx.medications.map((m) => ({
          drug: m.medicine,
          durationDays: m.days ? Number(m.days) : undefined,
          timesPerDay: m.timesPerDay || undefined,
          timing: (m.timing === "Before meal"
            ? "before"
            : m.timing === "After meal"
            ? "after"
            : undefined) as "before" | "after" | undefined,
        })),
        investigations: pdfRx.investigations,
        advice: pdfRx.advice,
        puid: pdfRx.patientUid
          ? parseInt(pdfRx.patientUid.replace(/\D/g, ""), 10)
          : undefined,
        followupDays: pdfRx.followUpDays ?? undefined,
      }
    : null;

  return (
    <>
      {/* Hidden PDF template — only mounted during capture */}
      {pdfRx && pdfData && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }} aria-hidden>
          <PrescriptionTemplate
            data={pdfData}
            doctor={pdfDoctor}
            onMount={() => {
              pdfMountedRef.current?.();
              pdfMountedRef.current = null;
            }}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Prescriptions from your doctor visits
          </p>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Empty state */}
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

        {/* Prescription cards */}
        {!loading && !error && prescriptions.length > 0 && (
          <div className="space-y-4">
            {prescriptions.map((rx) => (
              <PrescriptionCard
                key={rx._id}
                rx={rx}
                onDownload={handleDownload}
                isDownloading={pdfCapturing === rx._id}
              />
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
