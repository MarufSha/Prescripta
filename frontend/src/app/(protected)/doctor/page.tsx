"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import {
  UserCircle,
  Mail,
  Phone,
  Award,
  MapPin,
  GraduationCap,
  Stethoscope,
  BadgeCheck,
  Building2,
  ClipboardList,
} from "lucide-react";
import type { DoctorChamber } from "@/store/authStore";

// ─── Sub-components ──────────────────────────────────────────────────────────

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
        <Icon className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-gray-100 dark:border-gray-800 py-2.5 last:border-0">
      <span className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {value ?? "—"}
      </span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-5 shadow-sm backdrop-blur-xl">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${gradient}`}
      >
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function TagList({
  items,
  colorClass,
}: {
  items: string[];
  colorClass: string;
}) {
  if (!items.length) return <span className="text-sm text-gray-400">—</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${colorClass}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DoctorProfilePage() {
  const { user } = useAuthStore();
  const profile = user?.doctorProfile;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "DR";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* ── Profile Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-700 p-8 shadow-xl">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -right-4 top-16 h-20 w-20 rounded-full bg-white/5" />

        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          {/* Avatar */}
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-3xl font-bold text-white shadow-lg backdrop-blur-sm">
            {initials}
          </div>

          <div className="flex-1 text-white">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{user?.name ?? "Doctor"}</h1>
              {user?.isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>

            {!!profile?.specialties?.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              {profile?.bmdcNo && (
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  BMDC: {profile.bmdcNo}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {user?.email}
              </span>
              {profile?.mobileNumber && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {profile.mobileNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Specialties"
          value={profile?.specialties?.length ?? 0}
          icon={Stethoscope}
          gradient="bg-gradient-to-br from-emerald-500 to-green-600"
        />
        <StatCard
          label="Degrees"
          value={profile?.degrees?.length ?? 0}
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          label="Chambers"
          value={profile?.chambers?.length ?? 0}
          icon={Building2}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          label="Designations"
          value={profile?.designations?.length ?? 0}
          icon={ClipboardList}
          gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        />
      </div>

      {/* ── Info Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <Card title="Personal Information" icon={UserCircle}>
          <InfoRow label="Full Name" value={user?.name} />
          <InfoRow label="Email Address" value={user?.email} />
          <InfoRow label="Phone Number" value={profile?.mobileNumber} />
          <InfoRow label="BMDC Number" value={profile?.bmdcNo} />
          <InfoRow
            label="Member Since"
            value={user?.createdAt ? formatDate(user.createdAt) : null}
          />
          <InfoRow
            label="Last Login"
            value={user?.lastLogin ? formatDate(user.lastLogin) : null}
          />
        </Card>

        {/* Professional Info */}
        <Card title="Professional Information" icon={Stethoscope}>
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Specialties
              </p>
              <TagList
                items={profile?.specialties ?? []}
                colorClass="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Degrees
              </p>
              <TagList
                items={profile?.degrees ?? []}
                colorClass="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300"
              />
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Designations
              </p>
              <TagList
                items={profile?.designations ?? []}
                colorClass="bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Chambers ── */}
      {!!profile?.chambers?.length && (
        <Card title="Chambers" icon={Building2}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.chambers.map((chamber: DoctorChamber, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 p-4"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {chamber.name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {chamber.location}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
