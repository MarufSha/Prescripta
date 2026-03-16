"use client";

import { AdminUser } from "@/store/authStore";
import { formatDate } from "@/utils/date";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

type UserRole = "admin" | "doctor" | "patient";

type CurrentUser = {
  _id: string;
  role: UserRole;
};

type Props = {
  role: UserRole;
  users: AdminUser[];
  user: CurrentUser | null;
  isLoading: boolean;
  handleRoleChange: (
    userId: string,
    role: "doctor" | "patient",
  ) => Promise<void> | void;
  handleManualVerify: (userId: string) => Promise<void> | void;
  handleDeleteUser: (userId: string) => Promise<void> | void;
};

const roleMeta: Record<
  UserRole,
  { title: string; subtitle: string; empty: string }
> = {
  admin: {
    title: "Admin Accounts",
    subtitle: "System administrators with elevated permissions.",
    empty: "No admin accounts found.",
  },
  doctor: {
    title: "Doctor Accounts",
    subtitle: "Doctors who can later provide advice and prescriptions.",
    empty: "No doctor accounts found.",
  },
  patient: {
    title: "Patient Accounts",
    subtitle: "Patients using the platform.",
    empty: "No patient accounts found.",
  },
};

const badgeClassMap: Record<UserRole, string> = {
  admin: "border border-amber-500/30 bg-amber-500/10 text-amber-300",
  doctor: "border border-sky-500/30 bg-sky-500/10 text-sky-300",
  patient: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
};

const AdminTable = ({
  role,
  users,
  user,
  isLoading,
  handleRoleChange,
  handleManualVerify,
  handleDeleteUser,
}: Props) => {
  const filteredUsers = users.filter((u) => u.role === role);
  const meta = roleMeta[role];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          {meta.title}
        </h2>
        <p className="text-sm text-gray-400">{meta.subtitle}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950/40 shadow-lg">
        <table className="w-full min-w-[1280px] text-left border-collapse">
          <thead className="bg-gray-900/70">
            <tr className="border-b border-gray-800 text-sm text-gray-300">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Verified</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Last Login</th>
              <th className="px-4 py-3 font-semibold">Edit Role</th>
              <th className="px-4 py-3 font-semibold">Manual Request</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  {meta.empty}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isSelf = u._id === user?._id;
                const locked = isSelf || u.role === "admin";
                const canVerifyManually =
                  !u.isVerified && Boolean(u.manualVerificationRequested);

                return (
                  <tr
                    key={u._id}
                    className="border-b border-gray-800/80 text-sm text-gray-200 transition-colors duration-200 hover:bg-gray-900/40"
                  >
                    <td className="px-4 py-4 font-medium text-white">
                      {u.name}
                    </td>

                    <td className="px-4 py-4 text-gray-300">{u.email}</td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClassMap[u.role]}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          u.isVerified
                            ? "border border-green-500/30 bg-green-500/10 text-green-300"
                            : "border border-red-500/30 bg-red-500/10 text-red-300"
                        }`}
                      >
                        {u.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-300">
                      {u.createdAt ? formatDate(u.createdAt) : "-"}
                    </td>

                    <td className="px-4 py-4 text-gray-300">
                      {u.lastLogin ? formatDate(u.lastLogin) : "-"}
                    </td>

                    <td className="px-4 py-4">
                      {locked ? (
                        <span className="inline-flex rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-500">
                          Not allowed
                        </span>
                      ) : (
                        <Select
                          value={u.role}
                          disabled={isLoading}
                          onValueChange={(value) =>
                            void handleRoleChange(
                              u._id,
                              value as "doctor" | "patient",
                            )
                          }
                        >
                          <SelectTrigger
                            className="
                              w-[150px] border-gray-700 bg-gray-800/80 text-white
                              transition-all duration-200
                              hover:border-emerald-500/50
                              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                              data-[placeholder]:text-gray-400
                            "
                          >
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>

                          <SelectContent
                            className="
                              border border-gray-700 bg-gray-900/95 text-white
                              backdrop-blur-xl shadow-xl
                            "
                          >
                            <SelectItem
                              value="patient"
                              className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                            >
                              Patient
                            </SelectItem>
                            <SelectItem
                              value="doctor"
                              className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                            >
                              Doctor
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {canVerifyManually ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            Requested
                          </span>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => void handleManualVerify(u._id)}
                            className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                      ) : u.manualVerificationRequested ? (
                        <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                          Requested
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-gray-700 bg-gray-800/60 px-3 py-1 text-xs font-semibold text-gray-400">
                          None
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {locked ? (
                        <span className="inline-flex rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-500">
                          Not allowed
                        </span>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              disabled={isLoading}
                              className="inline-flex items-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 transition-all duration-200 hover:bg-red-500/20 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2
                                size={16}
                                className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110"
                              />
                            </button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="border border-gray-800 bg-gray-900/95 text-white backdrop-blur-xl shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Delete user account?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                This will permanently delete{" "}
                                <span className="font-semibold text-white">
                                  {u.name}
                                </span>{" "}
                                from the system. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white">
                                Cancel
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => void handleDeleteUser(u._id)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
