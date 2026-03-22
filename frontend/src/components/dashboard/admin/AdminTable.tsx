"use client";

import { useMemo, useEffect, useState } from "react";
import { AdminUser, DoctorProfile } from "@/store/authStore";
import { capitalize, formatDate } from "@/utils/date";
import { createPortal } from "react-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    doctorProfile?: DoctorProfile,
  ) => Promise<void> | void;
  handleManualVerify: (userId: string) => Promise<void> | void;
  handleDeleteUser: (userId: string) => Promise<void> | void;
};

type ConfirmActionState = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmButtonClassName?: string;
  onConfirm: () => Promise<void> | void;
};

type DoctorFormState = {
  specialtiesInput: string;
  bmdcNo: string;
  mobileNumber: string;
  designationsInput: string;
  degreesInput: string;
  chambers: {
    name: string;
    location: string;
  }[];
};

const ROW_OPTIONS = [5, 10, 20, 50, 100] as const;

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
    subtitle: "Doctors who can provide advice and prescriptions.",
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

const parseCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getInitialDoctorForm = (
  doctorProfile?: DoctorProfile,
): DoctorFormState => ({
  specialtiesInput: doctorProfile?.specialties?.join(", ") || "",
  bmdcNo: doctorProfile?.bmdcNo || "",
  mobileNumber: doctorProfile?.mobileNumber || "",
  designationsInput: doctorProfile?.designations?.join(", ") || "",
  degreesInput: doctorProfile?.degrees?.join(", ") || "",
  chambers:
    doctorProfile?.chambers?.length && Array.isArray(doctorProfile.chambers)
      ? doctorProfile.chambers.map((chamber) => ({
          name: chamber.name || "",
          location: chamber.location || "",
        }))
      : [{ name: "", location: "" }],
});

const AdminTable = ({
  role,
  users,
  user,
  isLoading,
  handleRoleChange,
  handleManualVerify,
  handleDeleteUser,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(
    null,
  );
  const [doctorModalUser, setDoctorModalUser] = useState<AdminUser | null>(
    null,
  );
  const [doctorForm, setDoctorForm] = useState<DoctorFormState>(
    getInitialDoctorForm(),
  );
  const [doctorModalError, setDoctorModalError] = useState<string | null>(null);
  const isDoctorModalOpen = Boolean(doctorModalUser);

  useEffect(() => {
    if (!isDoctorModalOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isDoctorModalOpen]);
  const filteredUsers = useMemo(
    () => users.filter((u) => u.role === role),
    [users, role],
  );

  const validUserIds = useMemo(() => new Set(users.map((u) => u._id)), [users]);

  const effectiveSelectedUserIds = useMemo(
    () => selectedUserIds.filter((id) => validUserIds.has(id)),
    [selectedUserIds, validUserIds],
  );

  const selectedUsers = useMemo(
    () => users.filter((u) => effectiveSelectedUserIds.includes(u._id)),
    [users, effectiveSelectedUserIds],
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, safeCurrentPage, rowsPerPage]);

  const selectableUsers = useMemo(() => {
    return paginatedUsers.filter((u) => {
      const isSelf = u._id === user?._id;
      const locked = isSelf || u.role === "admin";
      return !locked;
    });
  }, [paginatedUsers, user?._id]);

  const allVisibleSelectableIds = selectableUsers.map((u) => u._id);

  const allVisibleSelected =
    allVisibleSelectableIds.length > 0 &&
    allVisibleSelectableIds.every((id) =>
      effectiveSelectedUserIds.includes(id),
    );

  const someVisibleSelected =
    allVisibleSelectableIds.some((id) =>
      effectiveSelectedUserIds.includes(id),
    ) && !allVisibleSelected;

  const allSelectedCanVerifyManually =
    selectedUsers.length > 0 &&
    selectedUsers.every(
      (u) => Boolean(u.manualVerificationRequested) && !u.isVerified,
    );

  const selectedSingleUser =
    selectedUsers.length === 1 ? selectedUsers[0] : null;
  const hasMultipleSelectedRows = effectiveSelectedUserIds.length > 1;
  const canBulkConvertToPatient =
    selectedUsers.length > 1 && selectedUsers.some((u) => u.role === "doctor");

  const meta = roleMeta[role];

  const toggleRowSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedUserIds((prev) => {
      const currentValid = prev.filter((id) => validUserIds.has(id));

      if (allVisibleSelected) {
        return currentValid.filter(
          (id) => !allVisibleSelectableIds.includes(id),
        );
      }

      const merged = new Set([...currentValid, ...allVisibleSelectableIds]);
      return Array.from(merged);
    });
  };

  const clearSelection = () => {
    setSelectedUserIds([]);
  };

  const openConfirmAction = (action: ConfirmActionState) => {
    setConfirmAction(action);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      await confirmAction.onConfirm();
    } finally {
      setConfirmAction(null);
    }
  };

  const openDoctorModal = (targetUser: AdminUser) => {
    setDoctorModalUser(targetUser);
    setDoctorForm(getInitialDoctorForm(targetUser.doctorProfile));
    setDoctorModalError(null);
  };

  const closeDoctorModal = () => {
    setDoctorModalUser(null);
    setDoctorForm(getInitialDoctorForm());
    setDoctorModalError(null);
  };

  const updateDoctorFormField = (
    field: keyof Omit<DoctorFormState, "chambers">,
    value: string,
  ) => {
    setDoctorForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateChamberField = (
    index: number,
    field: "name" | "location",
    value: string,
  ) => {
    setDoctorForm((prev) => ({
      ...prev,
      chambers: prev.chambers.map((chamber, chamberIndex) =>
        chamberIndex === index ? { ...chamber, [field]: value } : chamber,
      ),
    }));
  };

  const addChamber = () => {
    setDoctorForm((prev) => ({
      ...prev,
      chambers: [...prev.chambers, { name: "", location: "" }],
    }));
  };

  const removeChamber = (index: number) => {
    setDoctorForm((prev) => ({
      ...prev,
      chambers:
        prev.chambers.length === 1
          ? [{ name: "", location: "" }]
          : prev.chambers.filter((_, chamberIndex) => chamberIndex !== index),
    }));
  };

  const submitDoctorConversion = async () => {
    if (!doctorModalUser) return;

    const doctorProfile: DoctorProfile = {
      specialties: parseCommaSeparated(doctorForm.specialtiesInput),
      bmdcNo: doctorForm.bmdcNo.trim(),
      mobileNumber: doctorForm.mobileNumber.trim(),
      designations: parseCommaSeparated(doctorForm.designationsInput),
      degrees: parseCommaSeparated(doctorForm.degreesInput),
      chambers: doctorForm.chambers
        .map((chamber) => ({
          name: chamber.name.trim(),
          location: chamber.location.trim(),
        }))
        .filter((chamber) => chamber.name || chamber.location),
    };

    if (doctorProfile.specialties.length === 0) {
      setDoctorModalError("At least one specialty is required.");
      return;
    }

    if (!doctorProfile.bmdcNo) {
      setDoctorModalError("BMDC No. is required.");
      return;
    }

    if (!doctorProfile.mobileNumber) {
      setDoctorModalError("Mobile number is required.");
      return;
    }

    if (doctorProfile.designations.length === 0) {
      setDoctorModalError("At least one designation is required.");
      return;
    }

    if (doctorProfile.degrees.length === 0) {
      setDoctorModalError("At least one degree is required.");
      return;
    }

    if (doctorProfile.chambers.length === 0) {
      setDoctorModalError("At least one chamber is required.");
      return;
    }

    const hasInvalidChamber = doctorProfile.chambers.some(
      (chamber) => !chamber.name || !chamber.location,
    );

    if (hasInvalidChamber) {
      setDoctorModalError(
        "Each chamber must have both a chamber name and chamber location.",
      );
      return;
    }

    setDoctorModalError(null);

    try {
      await handleRoleChange(doctorModalUser._id, "doctor", doctorProfile);
      if (effectiveSelectedUserIds.includes(doctorModalUser._id)) {
        clearSelection();
      }
      closeDoctorModal();
    } catch (error) {
      console.error("Doctor conversion failed:", error);
      setDoctorModalError("Failed to convert user to doctor.");
    }
  };

  const handleRowRoleChange = (
    targetUser: AdminUser,
    nextRole: "doctor" | "patient",
  ) => {
    if (nextRole === targetUser.role) return;

    if (nextRole === "doctor") {
      openDoctorModal(targetUser);
      return;
    }

    openConfirmAction({
      title: "Convert user to patient?",
      description: `Are you sure you want to convert ${targetUser.name} to patient? Their doctor profile will be kept for future reuse.`,
      confirmLabel: "Convert to Patient",
      confirmButtonClassName:
        "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
      onConfirm: async () => {
        await handleRoleChange(targetUser._id, "patient");
      },
    });
  };

  const handleBulkRoleSelect = (nextRole: "doctor" | "patient") => {
    if (!selectedSingleUser) return;
    handleRowRoleChange(selectedSingleUser, nextRole);
  };

  const handleBulkConvertSelectedToPatient = () => {
    openConfirmAction({
      title: "Convert selected users to patient?",
      description: `Are you sure you want to convert ${
        selectedUsers.length
      } selected ${selectedUsers.length === 1 ? "user" : "users"} to patient?`,
      confirmLabel: "Convert Selected",
      confirmButtonClassName:
        "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
      onConfirm: async () => {
        const doctorsOnly = selectedUsers.filter((u) => u.role === "doctor");
        await Promise.all(
          doctorsOnly.map((targetUser) =>
            handleRoleChange(targetUser._id, "patient"),
          ),
        );
        clearSelection();
      },
    });
  };

  const handleBulkDelete = () => {
    openConfirmAction({
      title: "Delete selected users?",
      description: `Are you sure you want to delete ${
        effectiveSelectedUserIds.length
      } selected ${
        effectiveSelectedUserIds.length === 1 ? "user" : "users"
      }? This action cannot be undone.`,
      confirmLabel: "Delete Selected",
      confirmButtonClassName:
        "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
      onConfirm: async () => {
        await Promise.all(
          effectiveSelectedUserIds.map((id) => handleDeleteUser(id)),
        );
        clearSelection();
      },
    });
  };

  const handleBulkVerify = () => {
    openConfirmAction({
      title: "Verify selected users?",
      description: `Are you sure you want to manually verify ${
        selectedUsers.length
      } selected ${selectedUsers.length === 1 ? "user" : "users"}?`,
      confirmLabel: "Verify Selected",
      confirmButtonClassName:
        "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
      onConfirm: async () => {
        await Promise.all(selectedUsers.map((u) => handleManualVerify(u._id)));
        clearSelection();
      },
    });
  };

  const handleRowManualVerify = (targetUser: AdminUser) => {
    openConfirmAction({
      title: "Verify user manually?",
      description: `Are you sure you want to manually verify ${targetUser.name}?`,
      confirmLabel: "Verify User",
      confirmButtonClassName:
        "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer",
      onConfirm: async () => {
        await handleManualVerify(targetUser._id);
      },
    });
  };

  const handleRowDelete = (targetUser: AdminUser) => {
    openConfirmAction({
      title: "Delete user account?",
      description: `Are you sure you want to delete ${targetUser.name}? This action cannot be undone.`,
      confirmLabel: "Delete User",
      confirmButtonClassName:
        "bg-red-600 text-white hover:bg-red-700 cursor-pointer",
      onConfirm: async () => {
        await handleDeleteUser(targetUser._id);
      },
    });
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4];
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1];
  };

  const pageNumbers = getPageNumbers();

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {effectiveSelectedUserIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <p className="text-sm text-emerald-300">
              <span className="font-semibold text-white">
                {effectiveSelectedUserIds.length}
              </span>{" "}
              {effectiveSelectedUserIds.length === 1 ? "user" : "users"}{" "}
              selected
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {selectedSingleUser && (
                <Select
                  value={selectedSingleUser.role}
                  disabled={isLoading}
                  onValueChange={(value) =>
                    handleBulkRoleSelect(value as "doctor" | "patient")
                  }
                >
                  <SelectTrigger className="h-9 w-[190px] border-emerald-500/20 bg-gray-900/70 text-white hover:border-emerald-500/40 focus:border-emerald-500 focus:ring-emerald-500/30 cursor-pointer">
                    <SelectValue placeholder="Change selected role" />
                  </SelectTrigger>

                  <SelectContent className="border border-gray-700 bg-gray-900/95 text-white backdrop-blur-xl shadow-xl">
                    <SelectItem
                      value="patient"
                      disabled={selectedSingleUser.role === "patient"}
                      className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        {selectedSingleUser.role === "patient" ? (
                          <Check className="h-4 w-4 text-emerald-300" />
                        ) : (
                          <span className="h-4 w-4" />
                        )}
                        <span>Patient</span>
                      </div>
                    </SelectItem>

                    <SelectItem
                      value="doctor"
                      disabled={selectedSingleUser.role === "doctor"}
                      className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        {selectedSingleUser.role === "doctor" ? (
                          <Check className="h-4 w-4 text-emerald-300" />
                        ) : (
                          <span className="h-4 w-4" />
                        )}
                        <span>Doctor</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {canBulkConvertToPatient && (
                <button
                  type="button"
                  onClick={handleBulkConvertSelectedToPatient}
                  disabled={isLoading}
                  className="inline-flex items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  Change Selected to Patient
                </button>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <button
                      type="button"
                      onClick={handleBulkVerify}
                      disabled={isLoading || !allSelectedCanVerifyManually}
                      className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    >
                      <ShieldCheck size={14} />
                      Verify Selected
                    </button>
                  </span>
                </TooltipTrigger>

                {!allSelectedCanVerifyManually && (
                  <TooltipContent>
                    <p>
                      All selected users must have a manual verification
                      request.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>

              <button
                type="button"
                onClick={clearSelection}
                disabled={isLoading}
                className="inline-flex items-center rounded-lg border border-gray-700 bg-gray-900/70 px-3 py-2 text-xs font-semibold text-gray-300 transition-all duration-200 hover:bg-gray-800 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Clear Selection
              </button>

              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={14} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950/40 shadow-lg">
          <table className="w-full min-w-[1320px] text-left border-collapse">
            <thead className="bg-gray-900/70">
              <tr className="border-b border-gray-800 text-sm text-gray-300">
                <th className="w-[52px] px-4 py-3 font-semibold">
                  <Checkbox
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => toggleSelectAllVisible()}
                    disabled={
                      role === "admin" || allVisibleSelectableIds.length === 0
                    }
                    aria-label="Select all visible rows"
                    className="border-gray-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 cursor-pointer"
                  />
                </th>
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
                    colSpan={10}
                    className="px-4 py-10 text-center text-sm text-gray-400"
                  >
                    {meta.empty}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isSelf = u._id === user?._id;
                  const locked = isSelf || u.role === "admin";
                  const canVerifyManually =
                    !u.isVerified && Boolean(u.manualVerificationRequested);
                  const isSelected = effectiveSelectedUserIds.includes(u._id);

                  return (
                    <tr
                      key={u._id}
                      className={`border-b border-gray-800/80 text-sm text-gray-200 transition-colors duration-200 hover:bg-gray-900/40 ${
                        isSelected ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        {locked ? (
                          <Checkbox
                            checked={false}
                            disabled
                            aria-label={`Row for ${u.name} cannot be selected`}
                            className="border-gray-700 opacity-40"
                          />
                        ) : (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleRowSelection(u._id)}
                            aria-label={`Select ${u.name}`}
                            className="border-gray-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 cursor-pointer"
                          />
                        )}
                      </td>

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
                        ) : hasMultipleSelectedRows ? (
                          <span className="inline-flex rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-500 text-center">
                            Disabled for <br />
                            Multi-Selecting
                          </span>
                        ) : (
                          <Select
                            value={u.role}
                            disabled={isLoading}
                            onValueChange={(value) =>
                              handleRowRoleChange(
                                u,
                                value as "doctor" | "patient",
                              )
                            }
                          >
                            <SelectTrigger className="w-[170px] border-gray-700 bg-gray-800/80 text-white transition-all duration-200 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 data-[placeholder]:text-gray-400 cursor-pointer">
                              <SelectValue />
                            </SelectTrigger>

                            <SelectContent className="border border-gray-700 bg-gray-900/95 text-white backdrop-blur-xl shadow-xl">
                              <SelectItem
                                value="patient"
                                disabled={u.role === "patient"}
                                className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                              >
                                <div className="flex items-center gap-2">
                                  {u.role === "patient" ? (
                                    <Check className="h-4 w-4 text-emerald-300" />
                                  ) : (
                                    <span className="h-4 w-4" />
                                  )}
                                  <span>Patient</span>
                                </div>
                              </SelectItem>

                              <SelectItem
                                value="doctor"
                                disabled={u.role === "doctor"}
                                className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                              >
                                <div className="flex items-center gap-2">
                                  {u.role === "doctor" ? (
                                    <Check className="h-4 w-4 text-emerald-300" />
                                  ) : (
                                    <span className="h-4 w-4" />
                                  )}
                                  <span>Doctor</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {hasMultipleSelectedRows ? (
                          <span className="inline-flex rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-500">
                            Use bulk actions
                          </span>
                        ) : canVerifyManually ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                              Requested
                            </span>

                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => handleRowManualVerify(u)}
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
                        ) : hasMultipleSelectedRows ? (
                          <span className="inline-flex rounded-lg border border-gray-700 bg-gray-800/60 px-3 py-2 text-xs font-medium text-gray-500">
                            Use bulk actions
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleRowDelete(u)}
                            className="group inline-flex items-center rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300 transition-all duration-200 hover:bg-red-500/20 hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2
                              size={16}
                              className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-110"
                            />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-evenly gap-4 rounded-2xl border border-gray-800 bg-gray-900/50 px-4 py-3 overflow-x-auto">
            <div className="flex min-w-max items-center gap-4">
              <p className="text-sm text-gray-400 whitespace-nowrap">
                Showing{" "}
                <span className="font-medium text-white">
                  {(safeCurrentPage - 1) * rowsPerPage + 1}
                </span>{" "}
                –{" "}
                <span className="font-medium text-white">
                  {Math.min(
                    safeCurrentPage * rowsPerPage,
                    filteredUsers.length,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-white">
                  {filteredUsers.length}
                </span>{" "}
                {capitalize(role)}{" "}
                {filteredUsers.length === 1 ? "Account" : "Accounts"}
              </p>

              <span className="text-gray-700">|</span>

              {filteredUsers.length > rowsPerPage && (
                <>
                  <Pagination>
                    <PaginationContent className="flex-nowrap">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (safeCurrentPage > 1) {
                              setCurrentPage(safeCurrentPage - 1);
                            }
                          }}
                          className={
                            safeCurrentPage === 1
                              ? "pointer-events-none opacity-50 text-gray-500"
                              : "cursor-pointer border border-transparent bg-transparent text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20"
                          }
                        />
                      </PaginationItem>

                      {pageNumbers[0] > 1 && (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(1);
                              }}
                              className="cursor-pointer border border-transparent bg-transparent text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20"
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>

                          {pageNumbers[0] > 2 && (
                            <PaginationItem>
                              <PaginationEllipsis className="text-gray-500" />
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {pageNumbers.map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={safeCurrentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            className={
                              safeCurrentPage === page
                                ? "cursor-pointer border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                                : "cursor-pointer border border-transparent bg-transparent text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20"
                            }
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                          {pageNumbers[pageNumbers.length - 1] <
                            totalPages - 1 && (
                            <PaginationItem>
                              <PaginationEllipsis className="text-gray-500" />
                            </PaginationItem>
                          )}

                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(totalPages);
                              }}
                              className="cursor-pointer border border-transparent bg-transparent text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (safeCurrentPage < totalPages) {
                              setCurrentPage(safeCurrentPage + 1);
                            }
                          }}
                          className={
                            safeCurrentPage === totalPages
                              ? "pointer-events-none opacity-50 text-gray-500"
                              : "cursor-pointer border border-transparent bg-transparent text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  <span className="text-gray-700">|</span>
                </>
              )}

              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-sm text-gray-400">Rows per page</span>

                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-[90px] border-gray-700 bg-gray-800/80 text-white hover:border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/30 cursor-pointer">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>

                  <SelectContent className="border border-gray-700 bg-gray-900/95 text-white backdrop-blur-xl shadow-xl">
                    {ROW_OPTIONS.map((option) => (
                      <SelectItem
                        key={option}
                        value={String(option)}
                        className="cursor-pointer focus:bg-emerald-500/20 focus:text-white"
                      >
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <AlertDialog
          open={Boolean(confirmAction)}
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
        >
          <AlertDialogContent
            className="
              fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-lg
              -translate-x-1/2 translate-y-0
              rounded-2xl border border-gray-800 bg-gray-900/95 text-white
              shadow-2xl backdrop-blur-xl
              max-h-[calc(100dvh-2rem)] overflow-y-auto
              data-[state=open]:animate-in data-[state=closed]:animate-out
              data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
              data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-4
              sm:top-[10%] sm:w-full
            "
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                {confirmAction?.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                {confirmAction?.description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer">
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={() => void handleConfirmAction()}
                className={
                  confirmAction?.confirmButtonClassName ||
                  "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                }
              >
                {confirmAction?.confirmLabel || "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {doctorModalUser &&
          createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-[2px]">
              <div className="flex h-full w-full items-start justify-center overflow-hidden p-0 md:p-6">
                <div
                  className="
            flex h-dvh w-full flex-col
            bg-gray-950/98 text-white
            md:h-auto md:max-h-[calc(100dvh-3rem)] md:w-[min(960px,calc(100%-2rem))]
            md:rounded-3xl md:border md:border-gray-800 md:shadow-2xl md:backdrop-blur-xl
          "
                >
                  <div className="sticky top-0 z-10 flex items-start justify-between border-b border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur-xl md:rounded-t-3xl md:px-6 md:py-5">
                    <div className="pr-4">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Convert User to Doctor
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Fill in the required doctor profile details for{" "}
                        <span className="font-semibold text-white">
                          {doctorModalUser.name}
                        </span>
                        .
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeDoctorModal}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-gray-900/70 text-gray-300 transition hover:border-emerald-500/20 hover:text-white cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                          Specialty / Specialties
                        </label>
                        <input
                          value={doctorForm.specialtiesInput}
                          onChange={(e) =>
                            updateDoctorFormField(
                              "specialtiesInput",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Cardiology, Internal Medicine"
                          className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple specialties with commas.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          BMDC No.
                        </label>
                        <input
                          value={doctorForm.bmdcNo}
                          onChange={(e) =>
                            updateDoctorFormField("bmdcNo", e.target.value)
                          }
                          placeholder="Enter BMDC number"
                          className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          Mobile Number
                        </label>
                        <input
                          value={doctorForm.mobileNumber}
                          onChange={(e) =>
                            updateDoctorFormField(
                              "mobileNumber",
                              e.target.value,
                            )
                          }
                          placeholder="Enter mobile number"
                          className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                          Designation / Designations
                        </label>
                        <input
                          value={doctorForm.designationsInput}
                          onChange={(e) =>
                            updateDoctorFormField(
                              "designationsInput",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Consultant, Associate Professor"
                          className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple designations with commas.
                        </p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                          Degree / Degrees
                        </label>
                        <input
                          value={doctorForm.degreesInput}
                          onChange={(e) =>
                            updateDoctorFormField(
                              "degreesInput",
                              e.target.value,
                            )
                          }
                          placeholder="e.g. MBBS, FCPS, MD"
                          className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <p className="text-xs text-gray-500">
                          Separate multiple degrees with commas.
                        </p>
                      </div>

                      <div className="space-y-3 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-300">
                            Chambers
                          </label>

                          <button
                            type="button"
                            onClick={addChamber}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 cursor-pointer"
                          >
                            <Plus className="h-4 w-4" />
                            Add Chamber
                          </button>
                        </div>

                        <div className="space-y-3">
                          {doctorForm.chambers.map((chamber, index) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4"
                            >
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">
                                  Chamber {index + 1}
                                </p>

                                <button
                                  type="button"
                                  onClick={() => removeChamber(index)}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-gray-950 text-gray-400 transition hover:border-red-500/20 hover:text-red-300 cursor-pointer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <input
                                  value={chamber.name}
                                  onChange={(e) =>
                                    updateChamberField(
                                      index,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Chamber name"
                                  className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />

                                <input
                                  value={chamber.location}
                                  onChange={(e) =>
                                    updateChamberField(
                                      index,
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Chamber location"
                                  className="w-full rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {doctorModalError && (
                      <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                        {doctorModalError}
                      </p>
                    )}
                  </div>

                  <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-800 bg-gray-950/95 px-5 py-4 backdrop-blur-xl md:rounded-b-3xl md:px-6 md:py-5">
                    <button
                      type="button"
                      onClick={closeDoctorModal}
                      className="rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => void submitDoctorConversion()}
                      disabled={isLoading}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-green-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      Convert to Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    </TooltipProvider>
  );
};

export default AdminTable;
