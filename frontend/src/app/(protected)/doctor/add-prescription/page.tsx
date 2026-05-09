"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, X, Save, Trash2, Download, ClipboardList } from "lucide-react";
import { usePrescriptionStore, type Medication } from "@/store/prescriptionStore";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIMING_OPTIONS = [
  "Before meal",
  "After meal",
  "With meal",
  "D",
  "N",
  "E",
  "D+E",
  "D+N",
  "N+E",
  "D+N+E",
  "As directed",
];

const SEX_OPTIONS = ["Male", "Female", "Other"];

const todayStr = () => new Date().toISOString().split("T")[0];

const DEFAULT_FORM = {
  patientName: "",
  age: "",
  sex: "",
  mobile: "",
  weight: "",
  pulse: "",
  bp: "",
  spo2: "",
  others: "",
  date: todayStr(),
  chiefComplaints: [""] as string[],
  diagnosis: [""] as string[],
  medications: [{ medicine: "", days: "", timesPerDay: "", timing: "" }] as Medication[],
  investigations: [""] as string[],
  advice: [""] as string[],
  followUpDays: "",
};

type FormState = typeof DEFAULT_FORM;
type Errors = Partial<Record<"patientName" | "age" | "sex" | "mobile" | "chiefComplaints", string>>;

// ── Small reusable pieces ─────────────────────────────────────────────────────

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block mb-1 text-sm font-semibold">
      <span className={required ? "text-red-500 dark:text-red-400" : "text-gray-600 dark:text-gray-300"}>
        {text}
      </span>
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
}

function FormInput({
  placeholder, value, onChange, type = "text", min, max, step,
}: {
  placeholder?: string; value: string; onChange: (v: string) => void;
  type?: string; min?: string; max?: string; step?: string;
}) {
  return (
    <input
      type={type} min={min} max={max} step={step}
      placeholder={placeholder} value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
    />
  );
}

function FormSelect({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string;
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{title}</span>
      <button type="button" onClick={onAdd}
        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Remove"
      className="shrink-0 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

// ── Print template (hidden on screen) ────────────────────────────────────────

function PrintView({ form, patientUid }: { form: FormState; patientUid?: string }) {
  const followUpDate =
    form.followUpDays && form.date
      ? new Date(
          new Date(form.date).getTime() + Number(form.followUpDays) * 86400000
        ).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null;

  return (
    <div id="print-prescription" className="hidden print:block p-8 text-black text-sm font-sans">
      <div className="border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-xl font-bold">Prescripta</h1>
        <p className="text-xs text-gray-600">Medical Prescription</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div><span className="font-semibold">Patient:</span> {form.patientName}</div>
        <div><span className="font-semibold">Age:</span> {form.age}</div>
        <div><span className="font-semibold">Sex:</span> {form.sex}</div>
        <div><span className="font-semibold">Mobile:</span> {form.mobile}</div>
        {form.weight && <div><span className="font-semibold">Weight:</span> {form.weight} kg</div>}
        <div><span className="font-semibold">Date:</span> {form.date ? new Date(form.date).toLocaleDateString("en-GB") : ""}</div>
        {patientUid && <div><span className="font-semibold">PUID:</span> {patientUid}</div>}
      </div>
      {[form.pulse, form.bp, form.spo2].some(Boolean) && (
        <div className="flex gap-4 text-xs mb-4">
          {form.pulse && <span><b>Pulse:</b> {form.pulse}</span>}
          {form.bp && <span><b>BP:</b> {form.bp}</span>}
          {form.spo2 && <span><b>SpO2:</b> {form.spo2}</span>}
        </div>
      )}
      {form.chiefComplaints.filter(Boolean).length > 0 && (
        <div className="mb-3">
          <p className="font-semibold">C/C:</p>
          <ul className="list-disc list-inside">
            {form.chiefComplaints.filter(Boolean).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      {form.diagnosis.filter(Boolean).length > 0 && (
        <div className="mb-3">
          <p className="font-semibold">D/x:</p>
          <ul className="list-disc list-inside">
            {form.diagnosis.filter(Boolean).map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      )}
      {form.medications.filter((m) => m.medicine).length > 0 && (
        <div className="mb-3">
          <p className="font-semibold mb-1">R/X:</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-400">
                {["Medicine", "Days", "Times/Day", "Timing"].map((h) => (
                  <th key={h} className="text-left pb-1 pr-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {form.medications.filter((m) => m.medicine).map((m, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1 pr-2">{m.medicine}</td>
                  <td className="py-1 pr-2">{m.days}</td>
                  <td className="py-1 pr-2">{m.timesPerDay}</td>
                  <td className="py-1">{m.timing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {form.investigations.filter(Boolean).length > 0 && (
        <div className="mb-3">
          <p className="font-semibold">Investigations:</p>
          <ul className="list-disc list-inside">
            {form.investigations.filter(Boolean).map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </div>
      )}
      {form.advice.filter(Boolean).length > 0 && (
        <div className="mb-3">
          <p className="font-semibold">Advice:</p>
          <ul className="list-disc list-inside">
            {form.advice.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      {followUpDate && <p className="mt-4 font-semibold">Follow up: {followUpDate}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AddPrescriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const { createPrescription, updatePrescription, getPrescriptionById, isSaving, error, clearError } =
    usePrescriptionStore();

  const [form, setFormState] = useState<FormState>({ ...DEFAULT_FORM, date: todayStr() });
  const [errors, setErrors] = useState<Errors>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [savedPuid, setSavedPuid] = useState<string | undefined>();
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (!editId) return;
    setIsLoadingEdit(true);
    getPrescriptionById(editId)
      .then((p) => {
        setFormState({
          patientName: p.patientName,
          age: String(p.age),
          sex: p.sex,
          mobile: p.mobile,
          weight: p.weight != null ? String(p.weight) : "",
          pulse: p.pulse,
          bp: p.bp,
          spo2: p.spo2,
          others: p.others,
          date: p.date ? p.date.split("T")[0] : todayStr(),
          chiefComplaints: p.chiefComplaints.length ? p.chiefComplaints : [""],
          diagnosis: p.diagnosis.length ? p.diagnosis : [""],
          medications: p.medications.length
            ? p.medications
            : [{ medicine: "", days: "", timesPerDay: "", timing: "" }],
          investigations: p.investigations.length ? p.investigations : [""],
          advice: p.advice.length ? p.advice : [""],
          followUpDays: p.followUpDays != null ? String(p.followUpDays) : "",
        });
        setSavedPuid(p.patientUid);
      })
      .catch(() => router.push("/doctor/add-prescription"))
      .finally(() => setIsLoadingEdit(false));
  }, [editId, getPrescriptionById, router]);

  // ── field helpers ──────────────────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setFormState((prev) => ({ ...prev, [key]: value })),
    []
  );

  const setArrayItem = (
    key: "chiefComplaints" | "diagnosis" | "investigations" | "advice",
    idx: number,
    value: string
  ) =>
    setFormState((prev) => {
      const arr = [...(prev[key] as string[])];
      arr[idx] = value;
      return { ...prev, [key]: arr };
    });

  const addArrayItem = (key: "chiefComplaints" | "diagnosis" | "investigations" | "advice") =>
    setFormState((prev) => ({ ...prev, [key]: [...(prev[key] as string[]), ""] }));

  const removeArrayItem = (
    key: "chiefComplaints" | "diagnosis" | "investigations" | "advice",
    idx: number
  ) =>
    setFormState((prev) => {
      const arr = (prev[key] as string[]).filter((_, i) => i !== idx);
      return { ...prev, [key]: arr.length ? arr : [""] };
    });

  const setMed = (idx: number, field: keyof Medication, value: string) =>
    setFormState((prev) => {
      const meds = [...prev.medications];
      meds[idx] = { ...meds[idx], [field]: value };
      return { ...prev, medications: meds };
    });

  const addMed = () =>
    setFormState((prev) => ({
      ...prev,
      medications: [...prev.medications, { medicine: "", days: "", timesPerDay: "", timing: "" }],
    }));

  const removeMed = (idx: number) =>
    setFormState((prev) => {
      const meds = prev.medications.filter((_, i) => i !== idx);
      return {
        ...prev,
        medications: meds.length ? meds : [{ medicine: "", days: "", timesPerDay: "", timing: "" }],
      };
    });

  // ── validation ─────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.patientName.trim() || form.patientName.trim().length < 2)
      e.patientName = "Name must be at least 2 characters.";
    if (!form.age || isNaN(Number(form.age))) e.age = "Age is required.";
    if (!form.sex) e.sex = "Please select a gender.";
    if (!form.mobile.trim()) e.mobile = "Mobile number is required.";
    if (!form.chiefComplaints.some((c) => c.trim()))
      e.chiefComplaints = "Add at least one C/C.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    clearError();
    if (!validate()) return;

    const payload = {
      patientName: form.patientName.trim(),
      age: Number(form.age),
      sex: form.sex as "Male" | "Female" | "Other",
      mobile: form.mobile.trim(),
      weight: form.weight ? Number(form.weight) : null,
      pulse: form.pulse,
      bp: form.bp,
      spo2: form.spo2,
      others: form.others,
      date: form.date,
      chiefComplaints: form.chiefComplaints.filter((c) => c.trim()),
      diagnosis: form.diagnosis.filter((d) => d.trim()),
      medications: form.medications.filter((m) => m.medicine.trim()),
      investigations: form.investigations.filter((i) => i.trim()),
      advice: form.advice.filter((a) => a.trim()),
      followUpDays: form.followUpDays ? Number(form.followUpDays) : null,
    };

    try {
      const result = editId
        ? await updatePrescription(editId, payload)
        : await createPrescription(payload);
      setSavedPuid(result.patientUid);
      setSuccessMsg(editId ? "Prescription updated!" : "Prescription saved successfully!");
      if (!editId) {
        setFormState({ ...DEFAULT_FORM, date: todayStr() });
        setErrors({});
      }
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch {
      // error displayed from store
    }
  };

  const handleSaveOffline = () => {
    if (!validate()) return;
    try {
      const stored = JSON.parse(localStorage.getItem("offline_prescriptions") ?? "[]") as unknown[];
      stored.push({ ...form, savedAt: new Date().toISOString() });
      localStorage.setItem("offline_prescriptions", JSON.stringify(stored));
      setSuccessMsg("Saved offline!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setSuccessMsg("Failed to save offline.");
    }
  };

  const handleClear = () => {
    setFormState({ ...DEFAULT_FORM, date: todayStr() });
    setErrors({});
    clearError();
    setSavedPuid(undefined);
    if (editId) router.push("/doctor/add-prescription");
  };

  const followUpDate =
    form.followUpDays && form.date
      ? new Date(
          new Date(form.date).getTime() + Number(form.followUpDays) * 86400000
        ).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : null;

  if (isLoadingEdit) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        Loading prescription…
      </div>
    );
  }

  return (
    <>
      <PrintView form={form} patientUid={savedPuid} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-4xl space-y-4 print:hidden"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {editId ? "Edit Prescription" : "Add Prescription"}
            </h1>
            {savedPuid && (
              <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">PUID: {savedPuid}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/doctor/add-prescription/previous")}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ClipboardList className="h-4 w-4" />
            Previous Prescriptions
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm p-5 space-y-6">

          {/* Patient Info */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Patient Information
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <FieldLabel text="Name" required />
                <FormInput placeholder="Please Enter Name" value={form.patientName}
                  onChange={(v) => setField("patientName", v)} />
                {errors.patientName && <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>}
              </div>
              <div>
                <FieldLabel text="Age" required />
                <FormInput type="number" placeholder="Please Enter Age" min="0" max="150"
                  value={form.age} onChange={(v) => setField("age", v)} />
                {errors.age && <p className="mt-1 text-xs text-red-500">{errors.age}</p>}
              </div>
              <div>
                <FieldLabel text="Sex" required />
                <FormSelect value={form.sex} onChange={(v) => setField("sex", v)}
                  options={SEX_OPTIONS} placeholder="Please Select a Gender" />
                {errors.sex && <p className="mt-1 text-xs text-red-500">{errors.sex}</p>}
              </div>
              <div>
                <FieldLabel text="Mobile" required />
                <FormInput placeholder="Enter Mobile Number" value={form.mobile}
                  onChange={(v) => setField("mobile", v)} />
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
              </div>
              <div>
                <FieldLabel text="Weight (kg)" />
                <FormInput type="number" placeholder="0.1 – 1000" min="0.1" max="1000" step="0.1"
                  value={form.weight} onChange={(v) => setField("weight", v)} />
              </div>
              <div>
                <FieldLabel text="Date" />
                <FormInput type="date" value={form.date} onChange={(v) => setField("date", v)} />
              </div>
            </div>
          </section>

          {/* Vitals */}
          <section>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Vitals
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <FieldLabel text="Pulse" />
                <FormInput placeholder="e.g. 80/min" value={form.pulse} onChange={(v) => setField("pulse", v)} />
              </div>
              <div>
                <FieldLabel text="BP" />
                <FormInput placeholder="e.g. 120/80" value={form.bp} onChange={(v) => setField("bp", v)} />
              </div>
              <div>
                <FieldLabel text="SpO2" />
                <FormInput placeholder="e.g. 98%" value={form.spo2} onChange={(v) => setField("spo2", v)} />
              </div>
              <div>
                <FieldLabel text="Others" />
                <FormInput placeholder="Other info" value={form.others} onChange={(v) => setField("others", v)} />
              </div>
            </div>
          </section>

          {/* C/C */}
          <section>
            <SectionHeader title="C/C  (Chief Complaints)" onAdd={() => addArrayItem("chiefComplaints")} />
            <div className="space-y-2">
              {form.chiefComplaints.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FormInput placeholder="Enter a complaint..." value={c}
                    onChange={(v) => setArrayItem("chiefComplaints", i, v)} />
                  <RemoveBtn onClick={() => removeArrayItem("chiefComplaints", i)} />
                </div>
              ))}
            </div>
            {errors.chiefComplaints && (
              <p className="mt-1 text-xs text-red-500">{errors.chiefComplaints}</p>
            )}
          </section>

          {/* D/x */}
          <section>
            <SectionHeader title="D/x  (Diagnosis)" onAdd={() => addArrayItem("diagnosis")} />
            <div className="space-y-2">
              {form.diagnosis.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FormInput placeholder="Enter a diagnosis..." value={d}
                    onChange={(v) => setArrayItem("diagnosis", i, v)} />
                  <RemoveBtn onClick={() => removeArrayItem("diagnosis", i)} />
                </div>
              ))}
            </div>
          </section>

          {/* R/X */}
          <section>
            <SectionHeader title="R/X  (Medications)" onAdd={addMed} />
            <div className="space-y-2">
              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1.2fr_auto] gap-2 px-1">
                {["Medicine", "Days", "Times/Day", "Timing", ""].map((h) => (
                  <span key={h} className="text-xs font-medium text-gray-400 dark:text-gray-500">{h}</span>
                ))}
              </div>
              {form.medications.map((med, i) => (
                <div key={i}
                  className="flex flex-col gap-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 sm:grid sm:grid-cols-[2fr_1fr_1fr_1.2fr_auto] sm:items-center sm:p-2"
                >
                  <FormInput placeholder="e.g. Amoxicillin 500mg" value={med.medicine}
                    onChange={(v) => setMed(i, "medicine", v)} />
                  <FormInput placeholder="e.g. 7" value={med.days}
                    onChange={(v) => setMed(i, "days", v)} />
                  <FormInput placeholder="e.g. D+N+E" value={med.timesPerDay}
                    onChange={(v) => setMed(i, "timesPerDay", v)} />
                  <FormSelect value={med.timing} onChange={(v) => setMed(i, "timing", v)}
                    options={TIMING_OPTIONS} placeholder="When to take" />
                  <RemoveBtn onClick={() => removeMed(i)} />
                </div>
              ))}
            </div>
          </section>

          {/* Investigations */}
          <section>
            <SectionHeader title="Investigations" onAdd={() => addArrayItem("investigations")} />
            <div className="space-y-2">
              {form.investigations.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FormInput placeholder="Enter an investigation..." value={v}
                    onChange={(val) => setArrayItem("investigations", i, val)} />
                  <RemoveBtn onClick={() => removeArrayItem("investigations", i)} />
                </div>
              ))}
            </div>
          </section>

          {/* Advice + Follow-up */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px] items-start">
            <div>
              <SectionHeader title="Advice" onAdd={() => addArrayItem("advice")} />
              <div className="space-y-2">
                {form.advice.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FormInput placeholder="Enter advice..." value={a}
                      onChange={(v) => setArrayItem("advice", i, v)} />
                    <RemoveBtn onClick={() => removeArrayItem("advice", i)} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel text="Follow up in (days)" />
              <FormInput type="number" placeholder="e.g. 3" min="1"
                value={form.followUpDays} onChange={(v) => setField("followUpDays", v)} />
              {followUpDate && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">→ {followUpDate}</p>
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <button type="button" onClick={() => void handleSubmit()} disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : editId ? "Update" : "Save"}
            </button>

            <button type="button" onClick={handleSaveOffline}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Save Offline
            </button>

            <button type="button" onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Clear Form
            </button>

            <button type="button" onClick={() => window.print()}
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-gray-400 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
