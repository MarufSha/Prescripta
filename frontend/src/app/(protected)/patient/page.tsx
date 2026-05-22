"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import Link from "next/link";
import {
  UserCircle,
  Mail,
  Calendar,
  CalendarPlus,
  CalendarCheck,
  Settings,
  BadgeCheck,
} from "lucide-react";

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-6 shadow-sm backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-blue-500" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

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

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  gradient,
  hoverBorder,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  hoverBorder: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 ${hoverBorder} bg-white dark:bg-gray-900/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
    >
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${gradient}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}

export default function PatientDashboardPage() {
  const { user } = useAuthStore();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "PT";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 p-8 shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-16 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-3xl font-bold text-white shadow-lg backdrop-blur-sm">
            {initials}
          </div>

          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{user?.name ?? "Patient"}</h1>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              {user?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickActionCard
            href="/patient/appointments/book"
            icon={CalendarPlus}
            title="Book an Appointment"
            description="Schedule a visit with a doctor"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            hoverBorder="hover:border-blue-500/30"
          />
          <QuickActionCard
            href="/patient/appointments"
            icon={CalendarCheck}
            title="My Appointments"
            description="View your past and upcoming visits"
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
            hoverBorder="hover:border-indigo-500/30"
          />
          <QuickActionCard
            href="/patient/settings"
            icon={Settings}
            title="Settings"
            description="Manage your account preferences"
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            hoverBorder="hover:border-purple-500/30"
          />
        </div>
      </div>

      {/* Personal Info */}
      <Card title="Personal Information" icon={UserCircle}>
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
        <InfoRow
          label="Account Status"
          value={user?.isVerified ? "Verified" : "Pending Verification"}
        />
      </Card>
    </motion.div>
  );
}
