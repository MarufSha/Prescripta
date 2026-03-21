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
        await fetchCsrfToken();
      } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
      } finally {
        await checkAuth();
      }
    };

    void init();
  }, [fetchCsrfToken, checkAuth]);

  return <>{children}</>;
}
