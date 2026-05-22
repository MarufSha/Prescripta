"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  UserCircle,
  CalendarPlus,
  CalendarCheck,
  Settings,
  Heart,
  Menu,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

const navItems = [
  { label: "My Profile", href: "/patient", icon: UserCircle },
  { label: "Book Appointment", href: "/patient/appointments/book", icon: CalendarPlus },
  { label: "My Appointments", href: "/patient/appointments", icon: CalendarCheck },
  { label: "Settings", href: "/patient/settings", icon: Settings },
];

export default function PatientSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 border-r border-gray-200 dark:border-gray-800",
          "bg-white dark:bg-gray-950/70 backdrop-blur-xl transition-all duration-300",
          "md:relative md:z-auto md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-72 md:w-20" : "w-72",
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-indigo-900/40">
              <Heart className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                  Prescripta
                </p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Patient Panel
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
                (item.href !== "/patient" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  onClick={onMobileClose}
                  className={[
                    "group flex items-center rounded-2xl text-sm font-medium transition-all duration-200",
                    collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-2.5",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-gray-900 dark:text-white border border-blue-500/20 shadow-md shadow-indigo-900/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900/70 border border-transparent",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-blue-500"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-blue-500",
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
                className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900/70 text-gray-500 dark:text-gray-300 transition-all duration-200 hover:border-blue-500/30 hover:text-gray-900 dark:hover:text-white active:scale-95 cursor-pointer"
                aria-label="Expand sidebar"
              >
                <Menu className="h-5 w-5 text-blue-500" />
              </button>
            ) : (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/70 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Role
                </p>
                <p className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
                  Patient
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {user?.name ?? "Patient"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
