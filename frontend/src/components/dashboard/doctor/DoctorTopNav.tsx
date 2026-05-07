"use client";

import { useAuthStore } from "@/store/authStore";
import { LogOut, Menu, Stethoscope, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function DoctorTopNav({ onToggle }: Props) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: toggle + branding + greeting */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-200 transition-all duration-200 hover:border-emerald-500/30 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-emerald-500" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <Stethoscope className="h-4 w-4 text-emerald-500" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">
              Welcome back
            </p>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </h1>
          </div>
        </div>

        {/* Right: theme toggle + logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 transition-all duration-200 hover:border-emerald-500/30 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
          </button>

          <button
            onClick={() => void logout()}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/80 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-200 transition-all duration-200 hover:border-emerald-500/30 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white active:scale-95 cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-emerald-500" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
