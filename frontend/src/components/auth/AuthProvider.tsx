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

  // Heartbeat: keep the server-side session alive while the tab is open.
  // checkAuth refreshes heartbeatExpiresAt (2-min window) on the server.
  // When the tab closes, heartbeats stop and the session lock releases after 2 min.
  useEffect(() => {
    const interval = setInterval(() => {
      if (useAuthStore.getState().isAuthenticated) {
        void checkAuth();
      }
    }, 45_000);

    return () => clearInterval(interval);
  }, [checkAuth]);

  return <>{children}</>;
}
