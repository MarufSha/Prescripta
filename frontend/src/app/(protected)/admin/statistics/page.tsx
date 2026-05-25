"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Stethoscope,
  CalendarCheck,
  CheckCircle,
  TrendingUp,
  Pill,
  Activity,
  UserPlus,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`,
  withCredentials: true,
});

type MonthlyUserEntry = {
  _id: { year: number; month: number; role: string };
  count: number;
};

type MonthlyAppointmentEntry = {
  _id: { year: number; month: number; status: string };
  count: number;
};

type DetailedStats = {
  users: {
    total: number;
    doctor: number;
    patient: number;
    admin: number;
    superadmin: number;
  };
  appointments: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  topMedicines: { medicine: string; count: number }[];
  monthlyUsers: MonthlyUserEntry[];
  monthlyAppointments: MonthlyAppointmentEntry[];
};

const APPOINTMENT_COLORS = {
  completed: "#10b981",
  confirmed: "#3b82f6",
  pending: "#f59e0b",
  cancelled: "#ef4444",
};

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function buildMonthLabels(): { year: number; month: number; label: string }[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    };
  });
}

function buildMonthlyUserData(raw: MonthlyUserEntry[]) {
  const labels = buildMonthLabels();
  return labels.map(({ year, month, label }) => {
    const entries = raw.filter(
      (e) => e._id.year === year && e._id.month === month
    );
    const doc = entries.find((e) => e._id.role === "doctor")?.count ?? 0;
    const pat = entries.find((e) => e._id.role === "patient")?.count ?? 0;
    return { label, Doctors: doc, Patients: pat };
  });
}

function buildMonthlyAppointmentData(raw: MonthlyAppointmentEntry[]) {
  const labels = buildMonthLabels();
  return labels.map(({ year, month, label }) => {
    const entries = raw.filter(
      (e) => e._id.year === year && e._id.month === month
    );
    const total = entries.reduce((s, e) => s + e.count, 0);
    const completed =
      entries.find((e) => e._id.status === "completed")?.count ?? 0;
    return { label, Total: total, Completed: completed };
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-700/60 bg-gray-800/50 p-5 backdrop-blur-sm flex items-center gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-3xl font-bold text-white mt-0.5">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-700/60 bg-gray-800/50 p-6 backdrop-blur-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-600 bg-gray-900 p-3 shadow-xl text-sm">
      {label && <p className="text-gray-300 font-medium mb-2">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<DetailedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { csrfToken, fetchCsrfToken } = useAuthStore();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let token = csrfToken;
      if (!token) {
        await fetchCsrfToken();
        token = useAuthStore.getState().csrfToken;
      }
      const res = await api.get("/admin/detailed-stats", {
        headers: { "x-csrf-token": token ?? "" },
      });
      setStats(res.data.stats);
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ??
              "Failed to load statistics"
          : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  }, [csrfToken, fetchCsrfToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-gray-400 text-sm">Loading statistics…</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center max-w-sm">
          <Activity className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-red-300 font-medium">{error ?? "No data available"}</p>
          <button
            onClick={fetchStats}
            className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const appointmentPieData = [
    { name: "Completed", value: stats.appointments.completed, color: APPOINTMENT_COLORS.completed },
    { name: "Confirmed", value: stats.appointments.confirmed, color: APPOINTMENT_COLORS.confirmed },
    { name: "Pending", value: stats.appointments.pending, color: APPOINTMENT_COLORS.pending },
    { name: "Cancelled", value: stats.appointments.cancelled, color: APPOINTMENT_COLORS.cancelled },
  ].filter((d) => d.value > 0);

  const userPieData = [
    { name: "Patients", value: stats.users.patient, color: "#8b5cf6" },
    { name: "Doctors", value: stats.users.doctor, color: "#06b6d4" },
    { name: "Admins", value: stats.users.admin + stats.users.superadmin, color: "#f97316" },
  ].filter((d) => d.value > 0);

  const monthlyUserData = buildMonthlyUserData(stats.monthlyUsers);
  const monthlyApptData = buildMonthlyAppointmentData(stats.monthlyAppointments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-700/60 bg-gray-800/50 px-6 py-5 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Platform Statistics
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Real-time overview of users, appointments, and prescriptions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label="Total Users"
          value={stats.users.total}
          color="bg-violet-600"
        />
        <StatCard
          icon={Stethoscope}
          label="Doctors"
          value={stats.users.doctor}
          color="bg-cyan-600"
        />
        <StatCard
          icon={UserPlus}
          label="Patients"
          value={stats.users.patient}
          color="bg-purple-600"
        />
        <StatCard
          icon={CalendarCheck}
          label="Total Appointments"
          value={stats.appointments.total}
          color="bg-blue-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.appointments.completed}
          color="bg-emerald-600"
        />
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Appointment Status"
          subtitle="Distribution by status"
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={appointmentPieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {appointmentPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-gray-300 text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Distribution" subtitle="By role">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={userPieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
              >
                {userPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-gray-300 text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top 10 Prescribed Medicines */}
      <ChartCard
        title="Top 10 Most Prescribed Medicines"
        subtitle="Total prescription count across all doctors"
      >
        {stats.topMedicines.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Pill className="mx-auto h-10 w-10 text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">No prescription data yet</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={stats.topMedicines}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#374151"
              />
              <XAxis
                type="number"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={{ stroke: "#374151" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="medicine"
                width={160}
                tick={{ fill: "#d1d5db", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="count" name="Prescriptions" radius={[0, 6, 6, 0]}>
                {stats.topMedicines.map((_, i) => {
                  const hue = 140 + i * 8;
                  return (
                    <Cell
                      key={i}
                      fill={`hsl(${hue}, 65%, ${52 - i * 2}%)`}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Monthly Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="New Registrations"
          subtitle="Doctors & patients registered in the last 12 months"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={monthlyUserData}
              margin={{ left: -10, right: 8, top: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#374151" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(v) => (
                  <span className="text-gray-300 text-sm">{v}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="Doctors"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={{ r: 3, fill: "#06b6d4" }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="Patients"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#8b5cf6" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Appointment Trends"
          subtitle="Total vs completed appointments in the last 12 months"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={monthlyApptData}
              margin={{ left: -10, right: 8, top: 4, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={{ stroke: "#374151" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Legend
                formatter={(v) => (
                  <span className="text-gray-300 text-sm">{v}</span>
                )}
              />
              <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Appointment Status Breakdown */}
      <ChartCard
        title="Appointment Breakdown"
        subtitle="Status counts at a glance"
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(
            [
              { label: "Booked / Pending", value: stats.appointments.pending, color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" },
              { label: "Confirmed", value: stats.appointments.confirmed, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
              { label: "Completed", value: stats.appointments.completed, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
              { label: "Cancelled", value: stats.appointments.cancelled, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
            ] as const
          ).map(({ label, value, color, bg }) => (
            <div
              key={label}
              className={`rounded-xl border p-4 ${bg} text-center`}
            >
              <p className={`text-4xl font-bold ${color}`}>
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-gray-400 font-medium uppercase tracking-wider">
                {label}
              </p>
              {stats.appointments.total > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {Math.round((value / stats.appointments.total) * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Summary insight */}
      <div className="rounded-2xl border border-gray-700/60 bg-gray-800/30 px-6 py-4 flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-emerald-400 shrink-0" />
        <p className="text-sm text-gray-400">
          <span className="text-white font-semibold">
            {stats.appointments.total > 0
              ? Math.round(
                  (stats.appointments.completed / stats.appointments.total) * 100
                )
              : 0}
            % completion rate
          </span>{" "}
          across {stats.appointments.total.toLocaleString()} total appointments
          {stats.topMedicines[0]
            ? ` · Most prescribed: ${stats.topMedicines[0].medicine} (${stats.topMedicines[0].count}×)`
            : ""}
        </p>
      </div>
    </div>
  );
}
