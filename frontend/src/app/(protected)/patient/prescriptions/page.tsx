"use client";

import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

export default function PatientPrescriptionsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View prescriptions issued by your doctors
        </p>
      </div>

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
    </motion.div>
  );
}
