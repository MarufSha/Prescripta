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
      <div className="flex min-h-screen w-full text-white">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((prev) => !prev)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <AdminTopNav
            collapsed={collapsed}
            onToggle={() => setCollapsed((prev) => !prev)}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
