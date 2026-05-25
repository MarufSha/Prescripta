"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, X, User, Stethoscope, Building2, Clock } from "lucide-react";
import { useAuthStore, type DoctorChamber } from "@/store/authStore";
import { PhoneField } from "@/components/PhoneField";
import AvailabilityScheduler, {
  type DaySchedule,
  toDaySchedules,
  fromDaySchedules,
  initDaySchedules,
  hasScheduleErrors,
} from "@/components/AvailabilityScheduler";

// ── Small reusable components ─────────────────────────────────────────────────

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
      {text}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
    />
  );
}

function TagListEditor({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput("");
  };

  const remove = (idx: number) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
          <Icon className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  age: string;
  sex: string;
  personalMobile: string;
  specialties: string[];
  bmdcNo: string;
  mobileNumber: string;
  designations: string[];
  degrees: string[];
  chambers: DoctorChamber[];
  schedule: DaySchedule[];
};

export default function SettingsPage() {
  const { user, updateDoctorProfile, isLoading, error, message, clearError } =
    useAuthStore();

  const buildForm = useCallback(
    (): FormState => ({
      name: user?.name ?? "",
      age: user?.age ? String(user.age) : "",
      sex: user?.sex ?? "",
      personalMobile: user?.mobileNumber ?? "",
      specialties: user?.doctorProfile?.specialties ?? [],
      bmdcNo: user?.doctorProfile?.bmdcNo ?? "",
      mobileNumber: user?.doctorProfile?.mobileNumber ?? "",
      designations: user?.doctorProfile?.designations ?? [],
      degrees: user?.doctorProfile?.degrees ?? [],
      chambers: user?.doctorProfile?.chambers ?? [],
      schedule: user?.doctorProfile?.availability?.length
        ? toDaySchedules(user.doctorProfile.availability)
        : initDaySchedules(),
    }),
    [user],
  );

  const [form, setForm] = useState<FormState>(buildForm);
  const [localMsg, setLocalMsg] = useState("");

  useEffect(() => {
    setForm(buildForm());
  }, [buildForm]);

  useEffect(() => {
    if (message) {
      setLocalMsg(message);
      const t = setTimeout(() => {
        setLocalMsg("");
        clearError();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [message, clearError]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const setChamber = (idx: number, field: keyof DoctorChamber, value: string) =>
    setForm((prev) => {
      const next = [...prev.chambers];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, chambers: next };
    });

  const addChamber = () =>
    setForm((prev) => ({
      ...prev,
      chambers: [...prev.chambers, { name: "", location: "" }],
    }));

  const removeChamber = (idx: number) =>
    setForm((prev) => ({
      ...prev,
      chambers: prev.chambers.filter((_, i) => i !== idx),
    }));

  const handleSave = async () => {
    if (hasScheduleErrors(form.schedule)) {
      return;
    }
    clearError();
    await updateDoctorProfile({
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      sex: form.sex || undefined,
      mobileNumber: form.personalMobile || undefined,
      doctorProfile: {
        specialties: form.specialties,
        bmdcNo: form.bmdcNo,
        mobileNumber: form.mobileNumber,
        designations: form.designations,
        degrees: form.degrees,
        chambers: form.chambers.filter((c) => c.name.trim() && c.location.trim()),
        availability: fromDaySchedules(form.schedule),
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto max-w-3xl space-y-5"
      id="edit-doctor-info"
    >
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your profile and doctor information
        </p>
      </div>

      {localMsg && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {localMsg}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <SectionCard icon={User} title="Personal Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel text="Full Name" required />
              <TextInput
                value={form.name}
                onChange={(v) => set("name", v)}
                placeholder="Dr. John Doe"
              />
            </Field>
            <Field>
              <FieldLabel text="Email" />
              <TextInput value={user?.email ?? ""} onChange={() => {}} type="email" />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Email cannot be changed here
              </p>
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel text="Age" />
              <input
                type="number"
                min={1}
                max={120}
                value={form.age}
                onChange={(e) => set("age", e.target.value)}
                placeholder="Your age"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </Field>
            <Field>
              <FieldLabel text="Sex" />
              <select
                value={form.sex}
                onChange={(e) => set("sex", e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>
          <Field>
            <FieldLabel text="Personal Mobile" />
            <PhoneField
              value={form.personalMobile}
              onChange={(v) => set("personalMobile", v)}
              placeholder="Personal mobile number"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Doctor Profile */}
      <SectionCard icon={Stethoscope} title="Doctor Information">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel text="BMDC Registration No." />
              <TextInput
                value={form.bmdcNo}
                onChange={(v) => set("bmdcNo", v)}
                placeholder="e.g. A-12345"
              />
            </Field>
            <Field>
              <FieldLabel text="Professional Mobile" />
              <PhoneField
                value={form.mobileNumber}
                onChange={(v) => set("mobileNumber", v)}
                placeholder="Clinic / office number"
              />
            </Field>
          </div>

          <Field>
            <FieldLabel text="Specialties" />
            <TagListEditor
              tags={form.specialties}
              onChange={(v) => set("specialties", v)}
              placeholder="e.g. Cardiology — press Enter or Add"
            />
          </Field>

          <Field>
            <FieldLabel text="Designations" />
            <TagListEditor
              tags={form.designations}
              onChange={(v) => set("designations", v)}
              placeholder="e.g. Consultant — press Enter or Add"
            />
          </Field>

          <Field>
            <FieldLabel text="Degrees" />
            <TagListEditor
              tags={form.degrees}
              onChange={(v) => set("degrees", v)}
              placeholder="e.g. MBBS, MD — press Enter or Add"
            />
          </Field>
        </div>
      </SectionCard>

      {/* Chambers */}
      <SectionCard icon={Building2} title="Chambers">
        <div className="space-y-3">
          {form.chambers.map((chamber, i) => (
            <div
              key={i}
              className="group grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-3"
            >
              <TextInput
                value={chamber.name}
                onChange={(v) => setChamber(i, "name", v)}
                placeholder="Chamber name"
              />
              <TextInput
                value={chamber.location}
                onChange={(v) => setChamber(i, "location", v)}
                placeholder="Location / address"
              />
              <div className="flex items-center justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => removeChamber(i)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addChamber}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Chamber
          </button>
        </div>
      </SectionCard>

      {/* Weekly Availability */}
      <SectionCard icon={Clock} title="Weekly Availability">
        <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
          Toggle each day you are available and set one or more time slots. You can add
          multiple slots per day for split schedules (e.g. 07:00–10:00 and 20:00–22:00).
        </p>
        <AvailabilityScheduler
          value={form.schedule}
          onChange={(v) => set("schedule", v)}
        />
      </SectionCard>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </motion.div>
  );
}
