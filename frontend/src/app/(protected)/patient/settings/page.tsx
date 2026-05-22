"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import { Settings, UserCircle, Mail, Calendar, ShieldCheck } from "lucide-react";

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

export default function PatientSettingsPage() {
  const { user } = useAuthStore();

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

      {/* Account Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-6 shadow-sm backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Account Information
          </h3>
        </div>
        <InfoRow label="Full Name" value={user?.name} />
        <InfoRow label="Email Address" value={user?.email} />
        <InfoRow
          label="Member Since"
          value={user?.createdAt ? formatDate(user.createdAt) : null}
        />
        <InfoRow
          label="Last Login"
          value={user?.lastLogin ? formatDate(user.lastLogin) : null}
        />
      </div>

      {/* Account Status */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-6 shadow-sm backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Account Status
          </h3>
        </div>
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

      {/* Coming Soon notice */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 py-12 text-center">
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
