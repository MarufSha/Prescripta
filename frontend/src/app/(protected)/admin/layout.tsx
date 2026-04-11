"use client";
import { useState } from "react";
import AdminGuard from "@/components/auth/AdminGuard";
import AdminSidebar from "@/components/dashboard/admin/AdminSidebar";
import AdminTopNav from "@/components/dashboard/admin/AdminTopNav";
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AdminGuard>
      <div className="flex h-screen w-full overflow-hidden text-white">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <AdminTopNav
              collapsed={collapsed}
              onToggle={() => setCollapsed((prev) => !prev)}
            />
          </div>

          <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
