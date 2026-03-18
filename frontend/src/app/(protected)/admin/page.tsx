"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import {
  ShieldCheck,
  Users,
  Pill,
  ChartNoAxesColumn,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { users } = useAuthStore();

  const totalUsers = users.length;
  const totalDoctors = users.filter((u) => u.role === "doctor").length;
  const totalPatients = users.filter((u) => u.role === "patient").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  const cards = [
    {
      title: "Admins",
      value: totalAdmins,
      icon: ShieldCheck,
      href: "/admin/users",
    },
    {
      title: "Doctors",
      value: totalDoctors,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Patients",
      value: totalPatients,
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: ChartNoAxesColumn,
      href: "/admin/users",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
        <h2 className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
          Admin Overview
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Manage users, review prescriptions, and monitor platform activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href}>
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-gray-800 bg-gray-900/70 p-5 shadow-xl backdrop-blur-xl transition-colors hover:border-emerald-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>

                  <span className="text-3xl font-bold text-white">
                    {card.value}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-sm text-gray-400">{card.title}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white">Quick Actions</h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/users"
              className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4 transition hover:border-emerald-500/20 hover:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium text-white">User Management</p>
                  <p className="text-sm text-gray-400">
                    Change roles, verify accounts, delete users.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/prescriptions"
              className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4 transition hover:border-emerald-500/20 hover:bg-gray-900"
            >
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium text-white">View Prescriptions</p>
                  <p className="text-sm text-gray-400">
                    Review future medicine records and doctor activity.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/statistics"
              className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4 transition hover:border-emerald-500/20 hover:bg-gray-900 md:col-span-2"
            >
              <div className="flex items-center gap-3">
                <ChartNoAxesColumn className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium text-white">Statistics</p>
                  <p className="text-sm text-gray-400">
                    Explore future analytics and admin insights.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white">Admin Notes</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-400">
            <p>
              This panel is restricted to administrators only.
            </p>
            <p>
              Role changes, manual verification, and deletion controls are managed from the user management section.
            </p>
            <p>
              Prescription and statistics pages are ready for your next feature wave.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}