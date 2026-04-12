"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const fetchCsrfToken = useAuthStore((s) => s.fetchCsrfToken);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchCsrfToken(), checkAuth()]);
      } catch (error) {
        console.error("Auth bootstrap failed:", error);
      }
    };

    void init();
  }, [fetchCsrfToken, checkAuth]);

  return <>{children}</>;
}
