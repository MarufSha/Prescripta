"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";

export default function PatientDashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto mt-10 p-8 bg-gray-900/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-800 text-white"
    >
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
        Patient Dashboard
      </h1>

      <div className="space-y-4">
        <p>Name: {user?.name}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
        <p>Joined: {user?.createdAt ? formatDate(user.createdAt) : "-"}</p>
      </div>

      <button
        onClick={() => void logout()}
        className="mt-6 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-semibold cursor-pointer"
      >
        Logout
      </button>
    </motion.div>
  );
}
