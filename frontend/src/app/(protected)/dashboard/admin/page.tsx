"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminTable from "@/app/components/AdminTable";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const {
    user,
    users,
    logout,
    fetchUsers,
    updateUserRole,
    isLoading,
    verifyUserManually,
  } = useAuthStore();

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (
    userId: string,
    role: "doctor" | "patient",
  ) => {
    try {
      await updateUserRole(userId, role);

      toast.success("User role updated successfully");
    } catch (err) {
      console.error("Failed to update role:", err);

      toast.error("Failed to update user role");
    }
  };

  const handleManualVerify = async (userId: string) => {
    try {
      await verifyUserManually(userId);
      toast.success("User verified successfully");
    } catch (err) {
      console.error("Failed to verify user manually:", err);
      toast.error("Failed to verify user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto p-6 text-white space-y-6"
    >
      <div className="flex items-center bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-800">
        <div className="flex flex-1 flex-col justify-center items-center">
          <h1 className="text-3xl font-bold bg-linear-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 mt-2">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={() => void logout()}
          className="px-4 py-2 h-10 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 font-semibold cursor-pointer transition-all duration-200 hover:scale-[1.03] active:scale-95"
        >
          Logout
        </button>
      </div>
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-800">

        <div className="overflow-x-auto">
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="custom-tabs-list">
              <TabsTrigger value="admin" className="custom-tabs-trigger">
                Admin
              </TabsTrigger>

              <TabsTrigger value="doctor" className="custom-tabs-trigger">
                Doctor
              </TabsTrigger>

              <TabsTrigger value="patient" className="custom-tabs-trigger">
                Patient
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin" className="custom-tabs-content">
              <AdminTable
                role="admin"
                users={users}
                user={user}
                isLoading={isLoading}
                handleRoleChange={handleRoleChange}
                handleManualVerify={handleManualVerify}
              />
            </TabsContent>

            <TabsContent value="doctor" className="custom-tabs-content">
              <AdminTable
                role="doctor"
                users={users}
                user={user}
                isLoading={isLoading}
                handleRoleChange={handleRoleChange}
                handleManualVerify={handleManualVerify}
              />
            </TabsContent>

            <TabsContent value="patient" className="custom-tabs-content">
              <AdminTable
                role="patient"
                users={users}
                user={user}
                isLoading={isLoading}
                handleRoleChange={handleRoleChange}
                handleManualVerify={handleManualVerify}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
