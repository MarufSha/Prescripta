"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/date";

export default function AdminDashboardPage() {
  const {
    user,
    users,
    logout,
    fetchUsers,
    updateUserRole,
    isLoading,
    error,
    message,
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
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 text-white"
    >
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Admin Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Welcome, {user?.name}
            </p>
          </div>

          <button
            onClick={() => void logout()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 font-semibold cursor-pointer"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {message && <p className="text-green-400 mb-4">{message}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="py-3 px-3">Name</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Verified</th>
                <th className="py-3 px-3">Joined</th>
                <th className="py-3 px-3">Last Login</th>
                <th className="py-3 px-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === user?._id;

                return (
                  <tr key={u._id} className="border-b border-gray-800">
                    <td className="py-3 px-3">{u.name}</td>
                    <td className="py-3 px-3">{u.email}</td>
                    <td className="py-3 px-3 capitalize">{u.role}</td>
                    <td className="py-3 px-3">
                      {u.isVerified ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-3">
                      {u.createdAt ? formatDate(u.createdAt) : "-"}
                    </td>
                    <td className="py-3 px-3">
                      {u.lastLogin ? formatDate(u.lastLogin) : "-"}
                    </td>
                    <td className="py-3 px-3">
                      {isSelf || u.role === "admin" ? (
                        <span className="text-gray-500">Not allowed</span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={isLoading}
                          onChange={(e) =>
                            void handleRoleChange(
                              u._id,
                              e.target.value as "doctor" | "patient",
                            )
                          }
                          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2"
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}