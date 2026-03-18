"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Pill,
  ChartNoAxesColumn,
  ShieldCheck,
  Menu,
} from "lucide-react";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Prescriptions",
    href: "/admin/prescriptions",
    icon: Pill,
  },
  {
    label: "Statistics",
    href: "/admin/statistics",
    icon: ChartNoAxesColumn,
  },
];

export default function AdminSidebar({ collapsed, onToggle }: Props) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "hidden md:flex h-screen shrink-0 border-r border-gray-800 bg-gray-950/70 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-24" : "w-72",
      ].join(" ")}
    >
      <div className="flex h-full w-full flex-col px-4 py-6">
        <div
          className={[
            "mb-8 flex items-center",
            collapsed ? "justify-center" : "gap-3 px-3",
          ].join(" ")}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-emerald-900/40">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>

          {!collapsed && (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Prescripta
              </p>
              <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={[
                  "group flex items-center rounded-2xl text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                  isActive
                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white border border-emerald-500/20 shadow-md shadow-emerald-900/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/70 border border-transparent",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-emerald-300"
                      : "text-gray-500 group-hover:text-emerald-300",
                  ].join(" ")}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pt-6">
          {collapsed ? (
            <button
              type="button"
              onClick={onToggle}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/70 text-gray-300 transition-all duration-200 hover:border-emerald-500/20 hover:text-white active:scale-95 cursor-pointer"
              aria-label="Expand sidebar"
            >
              <Menu className="h-5 w-5 text-emerald-300" />
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </aside>
  );
}
