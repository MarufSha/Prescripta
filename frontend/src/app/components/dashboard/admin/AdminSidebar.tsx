"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  ChartNoAxesColumn,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    label: "Prescriptions",
    href: "/dashboard/admin/prescriptions",
    icon: Pill,
  },
  {
    label: "Statistics",
    href: "/dashboard/admin/statistics",
    icon: ChartNoAxesColumn,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-72 shrink-0 border-r border-gray-800 bg-gray-950/70 backdrop-blur-xl">
      <div className="flex w-full flex-col px-4 py-6">
        <div className="mb-8 flex items-center gap-3 px-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-emerald-900/40">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
              Prescripta
            </p>
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/admin" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border border-emerald-500/20 shadow-md shadow-emerald-900/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/70 border border-transparent",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-4 w-4 transition-colors",
                    isActive
                      ? "text-emerald-300"
                      : "text-gray-500 group-hover:text-emerald-300",
                  ].join(" ")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pt-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Access Level
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-300">
              Administrator
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Full system control and user management.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}