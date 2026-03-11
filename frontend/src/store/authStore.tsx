import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type FieldErrorMap = Record<string, string>;
type UserRole = "admin" | "doctor" | "patient";

type User = {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

type AdminUser = {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

type VerifyEmailResponse = {
  success: boolean;
  message: string;
  user: User;
};

type BackendFieldError = {
  msg: string;
  path?: string;
  location?: string;
};

type AuthState = {
  user: User | null;
  users: AdminUser[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  hasHydrated: boolean;
  error: string | null;
  message: string | null;
  fieldErrors: FieldErrorMap;

  signUp: (email: string, password: string, name: string) => Promise<void>;
  verifyEmail: (code: string) => Promise<VerifyEmailResponse>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;

  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: "doctor" | "patient") => Promise<void>;
};

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    return data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
};

const getFieldErrors = (err: unknown): FieldErrorMap => {
  if (!axios.isAxiosError(err)) return {};

  const data = err.response?.data as
    | { errors?: Record<string, BackendFieldError> }
    | undefined;

  if (!data?.errors) return {};

  return Object.entries(data.errors).reduce<FieldErrorMap>(
    (acc, [key, value]) => {
      acc[key] = value?.msg || "Invalid input";
      return acc;
    },
    {},
  );
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  users: [],
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  hasHydrated: false,
  error: null,
  message: null,
  fieldErrors: {},

  clearError: () =>
    set({
      error: null,
      message: null,
      fieldErrors: {},
    }),

  signUp: async (email, password, name) => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.post("/auth/signup", { email, password, name });

      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        message: null,
        fieldErrors: {},
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const msg = getErrorMessage(err, "Sign up failed");

      set({
        fieldErrors,
        error: Object.keys(fieldErrors).length > 0 ? null : msg,
        isLoading: false,
      });

      throw err;
    }
  },

  verifyEmail: async (code: string): Promise<VerifyEmailResponse> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.post<VerifyEmailResponse>("/auth/verify-email", {
        code,
      });

      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        message: null,
        fieldErrors: {},
      });

      return res.data;
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const msg = getErrorMessage(err, "Email verification failed");

      set({
        fieldErrors,
        error: Object.keys(fieldErrors).length > 0 ? null : msg,
        isLoading: false,
      });

      throw err;
    }
  },

  checkAuth: async (): Promise<void> => {
    set({
      isCheckingAuth: true,
      error: null,
    });

    try {
      const res = await api.get("/auth/check-auth");

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
      set({
        isCheckingAuth: false,
        hasHydrated: true,
      });
    }
  },

  login: async (email: string, password: string): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.post("/auth/login", { email, password });

      set({
        user: res.data.user as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        message: null,
        fieldErrors: {},
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const msg = getErrorMessage(err, "Login failed");

      set({
        fieldErrors,
        error: Object.keys(fieldErrors).length > 0 ? null : msg,
        isLoading: false,
      });

      throw err;
    }
  },

  logout: async (): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      await api.post("/auth/logout");

      set({
        user: null,
        users: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
        message: null,
        fieldErrors: {},
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Logout failed");

      set({
        error: msg,
        isLoading: false,
      });

      throw err;
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.post("/auth/forgot-password", { email });

      set({
        isLoading: false,
        message:
          res.data.message ||
          "If an account exists for this email, a password reset link has been sent",
        error: null,
        fieldErrors: {},
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const msg = getErrorMessage(err, "Error sending password reset email");

      set({
        fieldErrors,
        error: Object.keys(fieldErrors).length > 0 ? null : msg,
        isLoading: false,
      });

      throw err;
    }
  },

  resetPassword: async (
    token: string,
    newPassword: string,
  ): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });

      set({
        isLoading: false,
        message: res.data.message || "Password reset successful",
        error: null,
        fieldErrors: {},
      });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const msg = getErrorMessage(err, "Error resetting password");

      set({
        fieldErrors,
        error: Object.keys(fieldErrors).length > 0 ? null : msg,
        isLoading: false,
      });

      throw err;
    }
  },

  fetchUsers: async (): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.get("/admin/users");

      set({
        users: res.data.users as AdminUser[],
        isLoading: false,
        error: null,
        message: null,
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to fetch users");

      set({
        error: msg,
        isLoading: false,
      });

      throw err;
    }
  },

  updateUserRole: async (
    userId: string,
    role: "doctor" | "patient",
  ): Promise<void> => {
    set({
      isLoading: true,
      error: null,
      message: null,
      fieldErrors: {},
    });

    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role });

      set((state) => ({
        users: state.users.map((u) =>
          u._id === userId ? { ...u, role: res.data.user.role as UserRole } : u,
        ),
        isLoading: false,
        error: null,
        message: res.data.message || "Role updated successfully",
      }));
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to update user role");

      set({
        error: msg,
        isLoading: false,
      });

      throw err;
    }
  },
}));