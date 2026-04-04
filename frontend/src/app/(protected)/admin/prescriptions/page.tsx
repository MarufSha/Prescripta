import SuperAdminGuard from "@/components/auth/SuperAdminGuard";
export default function AdminPrescriptionsPage() {
  return (
    <SuperAdminGuard>
      <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl text-white">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Prescriptions
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          This page will show prescription records once that feature is built.
        </p>
      </div>
    </SuperAdminGuard>
  );
}