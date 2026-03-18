"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

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

    if (user.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (user.role === "doctor") {
      router.replace("/doctor");
      return;
    }

    router.replace("/patient");
  }, [isAuthenticated, user, isCheckingAuth, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return null;
}
