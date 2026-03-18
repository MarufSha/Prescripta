"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function VerifyEmailGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    // Not logged in -> login, and remember where they wanted to go
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Logged in + verified -> never allow verify page again
    if (user?.isVerified) {
      router.replace("/");
      return;
    }
  }, [isCheckingAuth, isAuthenticated, user?.isVerified, router, pathname]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If logged in but not verified, allow page
  if (isAuthenticated && !user?.isVerified) return <>{children}</>;

  return null;
}