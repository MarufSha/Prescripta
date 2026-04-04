"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getDashboardRoute } from "@/utils/getDashboardRoute";

export default function VerifyEmailGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user?.isVerified) {
      router.replace(getDashboardRoute(user));
      return;
    }
  }, [isCheckingAuth, isAuthenticated, user, router, pathname]);

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
