"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Clock,
  Hash,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  X,
  Plus,
  Trash2,
  Save,
} from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const DAYS_OF_WEEK = [
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
];

const TIMING_OPTIONS = ["Before meal", "After meal", "Anytime"];
const SEX_OPTIONS = ["Male", "Female", "Other"];

type Patient = { _id: string; name: string; email: string };
type TimeSlot = { startTime: string; endTime: string };
type Appointment = {
  _id: string;
  patient: Patient;
  day: string;
  timeSlot: TimeSlot;
  serialNumber: number;
  symptoms?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};
type SlotGroup = { slot: TimeSlot; appointments: Appointment[] };
type DayGroup  = { day: string; slots: SlotGroup[] };

function groupAppointments(appointments: Appointment[]): DayGroup[] {
  const byDay: Record<string, Record<string, Appointment[]>> = {};
  for (const appt of appointments) {
    const slotKey = `${appt.timeSlot.startTime}|${appt.timeSlot.endTime}`;
    if (!byDay[appt.day]) byDay[appt.day] = {};
    if (!byDay[appt.day][slotKey]) byDay[appt.day][slotKey] = [];
    byDay[appt.day][slotKey].push(appt);
  }
  return DAYS_OF_WEEK.filter((d) => byDay[d]).map((day) => ({
    day,
    slots: Object.entries(byDay[day])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slotKey, appts]) => {
        const [startTime, endTime] = slotKey.split("|");
        return {
          slot: { startTime, endTime },
          appointments: [...appts].sort((a, b) => a.serialNumber - b.serialNumber),
        };
      }),
  }));
}

// ── Prescription Modal ─────────────────────────────────────────────────────────

type Med = { medicine: string; days: string; timesPerDay: string; timing: string };

function PrescriptionModal({
  appointment,
  onClose,
  onComplete,
}: {
  appointment: Appointment;
  onClose: () => void;
  onComplete: (id: string) => void;
}) {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("Male");
  const [mobile, setMobile] = useState("");
  const [pulse, setPulse] = useState("");
  const [bp, setBp] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");
  const [complaints, setComplaints] = useState<string[]>(
    appointment.symptoms?.trim() ? [appointment.symptoms.trim()] : [""],
  );
  const [diagnosis, setDiagnosis] = useState<string[]>([""]);
  const [meds, setMeds] = useState<Med[]>([
    { medicine: "", days: "", timesPerDay: "", timing: "Anytime" },
  ]);
  const [advice, setAdvice] = useState<string[]>([""]);
  const [followUpDays, setFollowUpDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateList = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
    val: string,
  ) => setter((prev) => prev.map((v, i) => (i === idx ? val : v)));

  const addListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) =>
    setter((prev) => [...prev, ""]);

  const removeListItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    idx: number,
  ) => setter((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const updateMed = (idx: number, field: keyof Med, val: string) =>
    setMeds((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: val } : m)));

  const handleSave = async () => {
    if (!age || !mobile) {
      setError("Age and mobile number are required.");
      return;
    }
    if (!complaints.some((c) => c.trim())) {
      setError("At least one chief complaint is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const csrfRes = await axios.get(`${API_BASE_URL}/auth/csrf-token`, {
        withCredentials: true,
      });
      const csrfToken = String(csrfRes.data?.csrfToken ?? "");

      await axios.post(
        `${API_BASE_URL}/prescriptions`,
        {
          patientName: appointment.patient.name,
          age: Number(age),
          sex,
          mobile,
          pulse, bp, spo2,
          weight: weight ? Number(weight) : null,
          chiefComplaints: complaints.filter((c) => c.trim()),
          diagnosis: diagnosis.filter((d) => d.trim()),
          medications: meds.filter((m) => m.medicine.trim()),
          advice: advice.filter((a) => a.trim()),
          followUpDays: followUpDays ? Number(followUpDays) : null,
          patientUserId: appointment.patient._id,
          appointmentId: appointment._id,
          appointmentSlot: {
            day: appointment.day,
            startTime: appointment.timeSlot.startTime,
            endTime: appointment.timeSlot.endTime,
          },
        },
        { withCredentials: true, headers: { "x-csrf-token": csrfToken } },
      );

      onComplete(appointment._id);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError((err.response?.data?.message as string) ?? "Failed to save prescription");
      } else {
        setError("Failed to save prescription");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 transition-colors";

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 mt-5">
      {children}
    </p>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="flex flex-col w-full sm:w-[min(680px,calc(100%-2rem))] max-h-[96dvh] rounded-t-3xl sm:rounded-3xl bg-gray-50 dark:bg-gray-950 border-0 sm:border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-500" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Write Prescription</h3>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {appointment.patient.name} · {appointment.day} {appointment.timeSlot.startTime}–{appointment.timeSlot.endTime} · Serial #{appointment.serialNumber}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">

          {/* Patient basics */}
          <SectionLabel>Patient Info</SectionLabel>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Age *</label>
              <input type="number" min={0} max={150} placeholder="e.g. 35" value={age}
                onChange={(e) => setAge(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sex *</label>
              <select value={sex} onChange={(e) => setSex(e.target.value)} className={inputCls}>
                {SEX_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Mobile *</label>
              <input placeholder="+880…" value={mobile}
                onChange={(e) => setMobile(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Vitals */}
          <SectionLabel>Vitals <span className="text-gray-400 normal-case font-normal">(optional)</span></SectionLabel>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Weight (kg)", val: weight, set: setWeight, ph: "e.g. 70" },
              { label: "Pulse", val: pulse, set: setPulse, ph: "e.g. 80 bpm" },
              { label: "BP", val: bp, set: setBp, ph: "e.g. 120/80" },
              { label: "SpO₂", val: spo2, set: setSpo2, ph: "e.g. 98%" },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                <input placeholder={ph} value={val} onChange={(e) => set(e.target.value)} className={inputCls} />
              </div>
            ))}
          </div>

          {/* Chief complaints */}
          <SectionLabel>Chief Complaints *</SectionLabel>
          <div className="space-y-2">
            {complaints.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={`Complaint ${i + 1}`} value={c}
                  onChange={(e) => updateList(setComplaints, i, e.target.value)} className={`${inputCls} flex-1`} />
                {complaints.length > 1 && (
                  <button type="button" onClick={() => removeListItem(setComplaints, i)}
                    className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem(setComplaints)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add complaint
            </button>
          </div>

          {/* Diagnosis */}
          <SectionLabel>Diagnosis <span className="text-gray-400 normal-case font-normal">(optional)</span></SectionLabel>
          <div className="space-y-2">
            {diagnosis.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={`Diagnosis ${i + 1}`} value={d}
                  onChange={(e) => updateList(setDiagnosis, i, e.target.value)} className={`${inputCls} flex-1`} />
                {diagnosis.length > 1 && (
                  <button type="button" onClick={() => removeListItem(setDiagnosis, i)}
                    className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem(setDiagnosis)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add diagnosis
            </button>
          </div>

          {/* Medications */}
          <SectionLabel>Medications</SectionLabel>
          <div className="space-y-3">
            {meds.map((m, i) => (
              <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400">Medicine {i + 1}</span>
                  {meds.length > 1 && (
                    <button type="button"
                      onClick={() => setMeds((prev) => prev.filter((_, mi) => mi !== i))}
                      className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <input placeholder="Medicine name" value={m.medicine}
                  onChange={(e) => updateMed(i, "medicine", e.target.value)} className={inputCls} />
                <div className="grid grid-cols-3 gap-2">
                  <input placeholder="Days" value={m.days}
                    onChange={(e) => updateMed(i, "days", e.target.value)} className={inputCls} />
                  <input placeholder="Times/day" value={m.timesPerDay}
                    onChange={(e) => updateMed(i, "timesPerDay", e.target.value)} className={inputCls} />
                  <select value={m.timing} onChange={(e) => updateMed(i, "timing", e.target.value)} className={inputCls}>
                    {TIMING_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            ))}
            <button type="button"
              onClick={() => setMeds((prev) => [...prev, { medicine: "", days: "", timesPerDay: "", timing: "Anytime" }])}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add medicine
            </button>
          </div>

          {/* Advice + Follow-up */}
          <SectionLabel>Advice <span className="text-gray-400 normal-case font-normal">(optional)</span></SectionLabel>
          <div className="space-y-2">
            {advice.map((a, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={`Advice ${i + 1}`} value={a}
                  onChange={(e) => updateList(setAdvice, i, e.target.value)} className={`${inputCls} flex-1`} />
                {advice.length > 1 && (
                  <button type="button" onClick={() => removeListItem(setAdvice, i)}
                    className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem(setAdvice)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer">
              <Plus className="h-3.5 w-3.5" /> Add advice
            </button>
          </div>

          <SectionLabel>Follow-up <span className="text-gray-400 normal-case font-normal">(optional)</span></SectionLabel>
          <div className="flex items-center gap-2">
            <input type="number" min={1} placeholder="e.g. 7" value={followUpDays}
              onChange={(e) => setFollowUpDays(e.target.value)} className={`${inputCls} w-28`} />
            <span className="text-sm text-gray-500">days</span>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/80 px-5 py-4 shrink-0">
          <button type="button" onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            Cancel
          </button>
          <button type="button" onClick={() => void handleSave()} disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : "Save & Complete"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Patient row ────────────────────────────────────────────────────────────────

function AppointmentRow({
  appt,
  idx,
  onSelect,
}: {
  appt: Appointment;
  idx: number;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasSymptoms = !!appt.symptoms?.trim();

  return (
    <div className={`border-b last:border-b-0 border-gray-100 dark:border-gray-800 ${idx % 2 === 0 ? "" : "bg-gray-50/40 dark:bg-gray-800/20"}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {appt.serialNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{appt.patient.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{appt.patient.email}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasSymptoms && (
            <button type="button" onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <FileText className="h-3.5 w-3.5" />
              Symptoms
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          )}
          <button type="button" onClick={onSelect}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors cursor-pointer">
            <ClipboardList className="h-3.5 w-3.5" />
            Prescribe
          </button>
        </div>
      </div>
      {expanded && hasSymptoms && (
        <div className="px-4 pb-3 pl-[3.25rem]">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2">
            {appt.symptoms}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Slot card ──────────────────────────────────────────────────────────────────

function SlotCard({
  slot,
  appointments,
  onSelect,
}: SlotGroup & { onSelect: (a: Appointment) => void }) {
  const count = appointments.length;
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm overflow-hidden">
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
            {count} patient{count !== 1 ? "s" : ""} in line
          </span>
        </div>
      </div>
      <div>
        {appointments.map((appt, i) => (
          <AppointmentRow key={appt._id} appt={appt} idx={i} onSelect={() => onSelect(appt)} />
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
  const [prescribing, setPrescribing] = useState<Appointment | null>(null);

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

  const handleComplete = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a._id !== id));
    setPrescribing(null);
  };

  const grouped = useMemo(() => groupAppointments(appointments), [appointments]);
  const totalPatients = appointments.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Patients waiting — grouped by day and time slot
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

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-32 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="h-36 animate-pulse rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/50" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && grouped.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CalendarDays className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">No appointments yet</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Patients who book with you will appear here
          </p>
        </div>
      )}

      {!isLoading && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map(({ day, slots }) => {
            const dayTotal = slots.reduce((n, s) => n + s.appointments.length, 0);
            return (
              <div key={day}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-3">
                  <Hash className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                    {day}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {dayTotal} patient{dayTotal !== 1 ? "s" : ""} in line
                  </span>
                </div>

                <div className="space-y-3">
                  {slots.map((slotGroup) => (
                    <SlotCard
                      key={`${slotGroup.slot.startTime}-${slotGroup.slot.endTime}`}
                      {...slotGroup}
                      onSelect={setPrescribing}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {prescribing && (
        <PrescriptionModal
          appointment={prescribing}
          onClose={() => setPrescribing(null)}
          onComplete={handleComplete}
        />
      )}
    </motion.div>
  );
}
