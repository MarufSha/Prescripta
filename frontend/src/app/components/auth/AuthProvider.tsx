"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../../store/authStore"

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
