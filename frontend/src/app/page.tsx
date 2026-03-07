"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function LandingPage() {
  const router = useRouter();

  const { user, isAuthenticated, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    // not logged in
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // logged in but not verified
    if (!user?.isVerified) {
      router.replace("/verify-email");
      return;
    }

    // logged in + verified
    router.replace("/dashboard");
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
