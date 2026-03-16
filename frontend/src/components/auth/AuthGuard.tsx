"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import LoadingSpinner from "@/app/components/LoadingSpinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isCheckingAuth) return;

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!user?.isVerified) {
      router.replace("/verify-email");
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

  if (isAuthenticated && user?.isVerified) return <>{children}</>;

  return null;
}