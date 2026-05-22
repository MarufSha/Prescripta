"use client";

import { useState } from "react";
import PatientGuard from "@/components/auth/PatientGuard";
import PatientSidebar from "@/components/dashboard/patient/PatientSidebar";
import PatientTopNav from "@/components/dashboard/patient/PatientTopNav";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function PatientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  };

  return (
    <PatientGuard>
      <ThemeProvider>
        <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
          <PatientSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
            <div className="shrink-0">
              <PatientTopNav collapsed={collapsed} onToggle={handleToggle} />
            </div>

            <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </PatientGuard>
  );
}
