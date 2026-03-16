"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import AdminTable from "@/app/components/AdminTable";
import toast from "react-hot-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

export default function AdminUsersPage() {
  const {
    user,
    users,
    fetchUsers,
    updateUserRole,
    isLoading,
    verifyUserManually,
    deleteUser,
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Failed to delete user:", err);
      toast.error("Failed to delete user");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
        <h2 className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
          User Management
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Manage user roles, manual verification requests, and account deletion.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
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
              key="admin"
              role="admin"
              users={users}
              user={user}
              isLoading={isLoading}
              handleRoleChange={handleRoleChange}
              handleManualVerify={handleManualVerify}
              handleDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="doctor" className="custom-tabs-content">
            <AdminTable
              key="doctor"
              role="doctor"
              users={users}
              user={user}
              isLoading={isLoading}
              handleRoleChange={handleRoleChange}
              handleManualVerify={handleManualVerify}
              handleDeleteUser={handleDeleteUser}
            />
          </TabsContent>

          <TabsContent value="patient" className="custom-tabs-content">
            <AdminTable
              key="patient"
              role="patient"
              users={users}
              user={user}
              isLoading={isLoading}
              handleRoleChange={handleRoleChange}
              handleManualVerify={handleManualVerify}
              handleDeleteUser={handleDeleteUser}
            />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
