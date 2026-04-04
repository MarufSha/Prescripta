"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function SuperAdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!user?.isVerified) {
      router.replace("/verify-email");
      return;
    }

    if (user?.role !== "superadmin") {
      router.replace("/admin");
    }
  }, [isCheckingAuth, isAuthenticated, user?.isVerified, user?.role, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated && user?.isVerified && user?.role === "superadmin") {
    return <>{children}</>;
  }

  return null;
}
