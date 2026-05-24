import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// Reuse the CSRF mechanism from authStore
const ensureCsrf = async () => {
  const { csrfToken, fetchCsrfToken } = useAuthStore.getState();
  let token = csrfToken;
  if (!token) {
    await fetchCsrfToken();
    token = useAuthStore.getState().csrfToken;
  }
  if (token) api.defaults.headers.common["x-csrf-token"] = token;
  return token;
};

const withCsrf = async <T>(fn: () => Promise<T>): Promise<T> => {
  await ensureCsrf();
  try {
    return await fn();
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      await useAuthStore.getState().fetchCsrfToken();
      const token = useAuthStore.getState().csrfToken;
      if (token) api.defaults.headers.common["x-csrf-token"] = token;
      return await fn();
    }
    throw err;
  }
};

const errMsg = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? ((err.response?.data as { message?: string })?.message ?? err.message ?? fallback)
    : fallback;

// ── Types ─────────────────────────────────────────────────────────────────────

export type Medication = {
  medicine: string;
  days: string;
  timesPerDay: string;
  timing: string;
};

export type Prescription = {
  _id: string;
  doctorId: string;
  patientUid: string;
  visitNumber: number;
  patientName: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  mobile: string;
  weight: number | null;
  pulse: string;
  bp: string;
  spo2: string;
  others: string;
  date: string;
  chiefComplaints: string[];
  diagnosis: string[];
  medications: Medication[];
  investigations: string[];
  advice: string[];
  followUpDays: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PrescriptionFormData = {
  patientName: string;
  age: number;
  sex: string;
  mobile: string;
  weight: number | null;
  pulse: string;
  bp: string;
  spo2: string;
  others: string;
  date: string;
  chiefComplaints: string[];
  diagnosis: string[];
  medications: Medication[];
  investigations: string[];
  advice: string[];
  followUpDays: number | null;
  patientUserId?: string | null;
  appointmentId?: string | null;
  appointmentSlot?: { day: string; startTime: string; endTime: string };
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

type PrescriptionState = {
  prescriptions: Prescription[];
  pagination: Pagination;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchPrescriptions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<void>;

  createPrescription: (data: PrescriptionFormData) => Promise<Prescription>;
  updatePrescription: (id: string, data: PrescriptionFormData) => Promise<Prescription>;
  deletePrescription: (id: string) => Promise<void>;
  getPrescriptionById: (id: string) => Promise<Prescription>;
  getPatientHistory: (name: string, mobile: string, sex: string) => Promise<PatientHistory>;
  clearError: () => void;
};

export type PatientHistory = {
  found: boolean;
  patientUid?: string;
  visitCount?: number;
  prescriptions: Prescription[];
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
  prescriptions: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchPrescriptions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/prescriptions", { params });
      set({
        prescriptions: res.data.prescriptions as Prescription[],
        pagination: res.data.pagination as Pagination,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: errMsg(err, "Failed to fetch prescriptions") });
    }
  },

  createPrescription: async (data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await withCsrf(() => api.post("/prescriptions", data));
      const prescription = res.data.prescription as Prescription;
      set((s) => ({
        prescriptions: [prescription, ...s.prescriptions],
        pagination: { ...s.pagination, total: s.pagination.total + 1 },
        isSaving: false,
      }));
      return prescription;
    } catch (err) {
      set({ isSaving: false, error: errMsg(err, "Failed to save prescription") });
      throw err;
    }
  },

  updatePrescription: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const res = await withCsrf(() => api.put(`/prescriptions/${id}`, data));
      const updated = res.data.prescription as Prescription;
      set((s) => ({
        prescriptions: s.prescriptions.map((p) => (p._id === id ? updated : p)),
        isSaving: false,
      }));
      return updated;
    } catch (err) {
      set({ isSaving: false, error: errMsg(err, "Failed to update prescription") });
      throw err;
    }
  },

  deletePrescription: async (id) => {
    try {
      await withCsrf(() => api.delete(`/prescriptions/${id}`));
      set((s) => ({
        prescriptions: s.prescriptions.filter((p) => p._id !== id),
        pagination: { ...s.pagination, total: Math.max(0, s.pagination.total - 1) },
      }));
    } catch (err) {
      set({ error: errMsg(err, "Failed to delete prescription") });
      throw err;
    }
  },

  getPrescriptionById: async (id) => {
    const res = await api.get(`/prescriptions/${id}`);
    return res.data.prescription as Prescription;
  },

  getPatientHistory: async (name, mobile, sex) => {
    const res = await api.get("/prescriptions/patient-history", { params: { name, mobile, sex } });
    return res.data as PatientHistory;
  },

  clearError: () => set({ error: null }),
}));
