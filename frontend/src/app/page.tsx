"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getDashboardRoute } from "@/utils/getDashboardRoute";
import LandingUI from "@/components/landing/LandingUI";

export default function LandingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (isAuthenticated && user && !user.isVerified) {
      router.replace("/verify-email");
      return;
    }

    if (isAuthenticated && user?.isVerified) {
      router.replace(getDashboardRoute(user));
    }
  }, [isAuthenticated, user, isCheckingAuth, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <LandingUI />;
}
