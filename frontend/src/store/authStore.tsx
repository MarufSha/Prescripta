import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type User = {
  _id: string;
  email: string;
  name: string;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

type VerifyEmailResponse = {
  success: boolean;
  message: string;
  user: User;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  hasHydrated: boolean;
  error: string | null;
  message: string | null;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<VerifyEmailResponse>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = err.response?.data as any;
    return data?.message || err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  hasHydrated: false,
  message: null,

  clearError: () => set({ error: null }),
  

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/signup", { email, password, name });
      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Sign up failed");
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  verifyEmail: async (code: string): Promise<VerifyEmailResponse> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<VerifyEmailResponse>("/verify-email", {
        code,
      });
      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
      });
      return res.data;
    } catch (err) {
      const msg = getErrorMessage(err, "Email verification failed");
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isCheckingAuth: true, error: null });

    try {
      const res = await api.get("/check-auth");

      set({
        user: res.data.user as User,
        isAuthenticated: true,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } finally {
      set({ isCheckingAuth: false, hasHydrated: true });
    }
  },

  login: async (email: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/login", { email, password });
      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Login failed");
      set({ error: msg, isLoading: false });
      throw err;
    }
  },
  logout: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/logout");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ error: "Logout failed", isLoading: false });
      throw error;
    }
  },
  forgotPassword: async (email: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post("/forgot-password", { email });
      set({
        isLoading: false,
        message: res.data.message || "Password reset email sent",
      });
    } catch (error) {
      const msg = getErrorMessage(error, "Error sending password reset email");
      set({ error: msg, isLoading: false });
      throw error;
    }
  },
  resetPassword: async (token: string, password: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post(`/reset-password/${token}`, { password });
      set({
        isLoading: false,
        message: res.data.message || "Password reset successful",
      });
    } catch (error) {
      const msg = getErrorMessage(error, "Error resetting password");
      set({ error: msg, isLoading: false });
      throw error;
    }
  },
}));
