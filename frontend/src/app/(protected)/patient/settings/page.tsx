"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import { Save, Settings, UserCircle, ShieldCheck, Mail } from "lucide-react";
import { PhoneField } from "@/components/PhoneField";

function InfoRow({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-gray-800 py-2.5 last:border-0">
      <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value ?? "—"}</span>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors";

export default function PatientSettingsPage() {
  const { user, updateDoctorProfile, isLoading, error, message, clearError } = useAuthStore();

  const [name, setName] = useState(user?.name ?? "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [sex, setSex] = useState(user?.sex ?? "");
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber ?? "");
  const [localMsg, setLocalMsg] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setAge(user?.age ? String(user.age) : "");
    setSex(user?.sex ?? "");
    setMobileNumber(user?.mobileNumber ?? "");
  }, [user?.name, user?.age, user?.sex, user?.mobileNumber]);

  useEffect(() => {
    if (message) {
      setLocalMsg(message);
      const t = setTimeout(() => { setLocalMsg(""); clearError(); }, 3500);
      return () => clearTimeout(t);
    }
  }, [message, clearError]);

  const isDirty =
    name.trim() !== (user?.name ?? "") ||
    age !== (user?.age ? String(user.age) : "") ||
    sex !== (user?.sex ?? "") ||
    mobileNumber !== (user?.mobileNumber ?? "");

  const handleSave = async () => {
    clearError();
    await updateDoctorProfile({
      name,
      age: age ? Number(age) : undefined,
      sex: sex || undefined,
      mobileNumber: mobileNumber || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account preferences
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
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
            <UserCircle className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Personal Information</h2>
        </div>
        <div className="p-5 space-y-4">
          {/* Name + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-3 py-2 text-sm cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">Email cannot be changed</p>
            </div>
          </div>

          {/* Age + Sex */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Age
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Your age"
                className={`${inputCls} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="flex flex-col gap-1">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Mobile Number
            </label>
            <PhoneField
              value={mobileNumber}
              onChange={setMobileNumber}
              placeholder="Enter mobile number"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isLoading || !isDirty}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-6 shadow-sm backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Account Details
          </h3>
        </div>
        <InfoRow
          label="Member Since"
          value={user?.createdAt ? formatDate(user.createdAt) : null}
        />
        <InfoRow
          label="Last Login"
          value={user?.lastLogin ? formatDate(user.lastLogin) : null}
        />
        <InfoRow
          label="Account Status"
          value={user?.isVerified ? "Verified" : "Pending Verification"}
        />
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              user?.isVerified ? "bg-emerald-500/10" : "bg-amber-500/10"
            }`}
          >
            {user?.isVerified ? (
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <Mail className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.isVerified ? "Verified Account" : "Pending Verification"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.isVerified
                ? "Your account has been verified"
                : "Please check your email to verify your account"}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
          <Settings className="h-7 w-7 text-purple-500" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
          More Settings Coming Soon
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Additional account settings will be available here
        </p>
      </div>
    </motion.div>
  );
}
