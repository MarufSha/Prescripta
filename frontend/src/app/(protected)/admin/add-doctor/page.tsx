"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function AddDoctorPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { createDoctorInvite, isLoading, clearError } = useAuthStore();

  const handleSendInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    try {
      await createDoctorInvite(name, email);
      toast.success("Doctor invite sent successfully");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Failed to send doctor invite:", error);
      toast.error("Failed to send doctor invite");
    }
  };

  return (
    <div className="max-w-2xl w-xl mx-auto rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl text-white">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Add Doctor
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Send a secure onboarding link to a new doctor.
        </p>
      </div>

      <form onSubmit={handleSendInvite} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Doctor Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter doctor's full name"
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Doctor Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter doctor's email"
            className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex flex-col">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 font-semibold text-white transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? "Sending Invite..." : "Send Doctor Invite"}
          </button>
        </div>
      </form>
    </div>
  );
}
