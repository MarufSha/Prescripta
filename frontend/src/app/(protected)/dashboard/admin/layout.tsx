import AdminGuard from "@/app/components/auth/AdminGuard";
import AdminSidebar from "@/app/components/dashboard/admin/AdminSidebar";
import AdminTopNav from "@/app/components/dashboard/admin/AdminTopNav";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen text-white">
        <div className="mx-auto flex min-h-screen">
          <AdminSidebar />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AdminTopNav />

            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
