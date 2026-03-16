"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth || !user?.role) return;

    if (user.role === "admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (user.role === "doctor") {
      router.replace("/dashboard/doctor");
      return;
    }

    router.replace("/dashboard/patient");
  }, [user?.role, isCheckingAuth, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}