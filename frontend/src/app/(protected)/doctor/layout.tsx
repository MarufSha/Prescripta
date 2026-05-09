"use client";

import { useState } from "react";
import DoctorGuard from "@/components/auth/DoctorGuard";
import DoctorSidebar from "@/components/dashboard/doctor/DoctorSidebar";
import DoctorTopNav from "@/components/dashboard/doctor/DoctorTopNav";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function DoctorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <DoctorGuard>
      <ThemeProvider>
        <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
          <DoctorSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0">
              <DoctorTopNav
                collapsed={collapsed}
                onToggle={() => setCollapsed((prev) => !prev)}
              />
            </div>

            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </DoctorGuard>
  );
}
