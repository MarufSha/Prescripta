"use client";

import { useAuthStore } from "@/store/authStore";
import { LogOut, Shield } from "lucide-react";

export default function AdminTopNav() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-800 bg-gray-950/60 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <Shield className="h-4 w-4 text-emerald-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Welcome back
            </p>
            <h1 className="text-lg font-semibold text-white">{user?.name}</h1>
          </div>
        </div>

        <button
          onClick={() => void logout()}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2 text-sm font-medium text-gray-200 transition-all duration-200 hover:border-emerald-500/30 hover:bg-gray-800 hover:text-white active:scale-95 cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-emerald-300" />
          Logout
        </button>
      </div>
    </header>
  );
}
