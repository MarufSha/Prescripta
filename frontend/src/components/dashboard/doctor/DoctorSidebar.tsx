"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  UserCircle,
  Users,
  ClipboardList,
  Calendar,
  Settings,
  Stethoscope,
  Menu,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

const navItems = [
  { label: "My Profile", href: "/doctor", icon: UserCircle },
  { label: "Patients", href: "/doctor/patients", icon: Users },
  { label: "Prescriptions", href: "/doctor/prescriptions", icon: ClipboardList },
  { label: "Schedule", href: "/doctor/schedule", icon: Calendar },
  { label: "Settings", href: "/doctor/settings", icon: Settings },
];

export default function DoctorSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside
      className={[
        "hidden md:flex h-screen shrink-0 border-r border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-950/70 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      ].join(" ")}
    >
      <div className="flex h-full w-full flex-col px-3 py-6">
        {/* Logo */}
        <div
          className={[
            "mb-8 flex items-center",
            collapsed ? "justify-center" : "gap-3 px-2",
          ].join(" ")}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-emerald-900/40">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                Prescripta
              </p>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Doctor Panel
              </h2>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/doctor" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={[
                  "group flex items-center rounded-2xl text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-gray-900 dark:text-white border border-emerald-500/20 shadow-md shadow-emerald-900/20"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900/70 border border-transparent",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-500"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-emerald-500",
                  ].join(" ")}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer / collapse toggle */}
        <div className="mt-auto px-2 pt-6">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggle}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/70 text-gray-500 dark:text-gray-300 transition-all duration-200 hover:border-emerald-500/30 hover:text-gray-900 dark:hover:text-white active:scale-95 cursor-pointer"
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5 text-emerald-500" />
            </button>
          ) : (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                Role
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                Registered Doctor
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {user?.doctorProfile?.specialties?.[0] ?? "Medical Professional"}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
