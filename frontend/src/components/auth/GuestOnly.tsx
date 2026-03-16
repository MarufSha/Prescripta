"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (isAuthenticated) {
      router.replace(user?.isVerified ? "/dashboard" : "/verify-email");
    }
  }, [isCheckingAuth, isAuthenticated, user?.isVerified, router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If they are not authenticated, allow login/signup
  if (!isAuthenticated) return <>{children}</>;

  return null;
}