"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import SuperAdminGuard from "@/components/auth/SuperAdminGuard";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from "lucide-react";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

type Medicine = {
  _id: string;
  medicine_name: string;
  generic_name?: string;
  strength?: string;
  dosage_form?: string;
  company_name?: string;
  unit_price?: number;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

type SortField = "medicine_name" | "company_name" | "unit_price" | "generic_name";
type SortOrder = "asc" | "desc";
type SearchField = "medicine_name" | "company_name" | "generic_name" | "dosage_form";

const SEARCH_FIELD_LABELS: Record<SearchField, string> = {
  medicine_name: "Medicine Name",
  company_name: "Company",
  generic_name: "Generic Name",
  dosage_form: "Form",
};

const SORT_FIELD_LABELS: Record<SortField, string> = {
  medicine_name: "Medicine Name",
  company_name: "Company",
  unit_price: "Price",
  generic_name: "Generic Name",
};

function SortIcon({ field, active, order }: { field: SortField; active: SortField; order: SortOrder }) {
  if (field !== active) return <ChevronsUpDown className="inline-block ml-1 h-3.5 w-3.5 text-gray-500" />;
  return order === "asc"
    ? <ChevronUp className="inline-block ml-1 h-3.5 w-3.5 text-emerald-400" />
    : <ChevronDown className="inline-block ml-1 h-3.5 w-3.5 text-emerald-400" />;
}

export default function AdminPrescriptionsPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("medicine_name");
  const [sortBy, setSortBy] = useState<SortField>("medicine_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fieldDropdownRef = useRef<HTMLDivElement>(null);

  const fetchMedicines = useCallback(async (params: {
    page?: number; search?: string; searchField?: SearchField;
    sortBy?: SortField; sortOrder?: SortOrder;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/medicines", { params: { limit: 20, ...params } });
      setMedicines(res.data.medicines);
      setPagination(res.data.pagination);
    } catch {
      setError("Failed to load medicines.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (fieldDropdownRef.current && !fieldDropdownRef.current.contains(e.target as Node)) {
        setFieldDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Initial load
  useEffect(() => {
    void fetchMedicines({ page: 1, search: "", searchField: "medicine_name", sortBy: "medicine_name", sortOrder: "asc" });
  }, [fetchMedicines]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchMedicines({ page: 1, search, searchField, sortBy, sortOrder });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, searchField, sortBy, sortOrder, fetchMedicines]);

  const handleSort = (field: SortField) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePage = (newPage: number) => {
    void fetchMedicines({ page: newPage, search, searchField, sortBy, sortOrder });
  };

  return (
    <SuperAdminGuard>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
            Medicines
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            Browse, search, and sort the medicine database.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-3xl border border-gray-800 bg-gray-900/70 p-4 shadow-xl backdrop-blur-xl space-y-3">
          {/* Row 1: search bar + sort buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Field dropdown + search input */}
            <div className="flex flex-1 items-center gap-0 rounded-xl border border-gray-700 bg-gray-800/60 overflow-hidden">
              <div ref={fieldDropdownRef} className="relative shrink-0">
                <button
                  onClick={() => setFieldDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-300 border-r border-gray-700 hover:bg-gray-700/50 transition-colors whitespace-nowrap"
                >
                  <Search className="h-3.5 w-3.5 text-emerald-400" />
                  {SEARCH_FIELD_LABELS[searchField]}
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </button>
                {fieldDropdownOpen && (
                  <div className="absolute top-full left-0 z-20 mt-1 w-40 rounded-xl border border-gray-700 bg-gray-900 shadow-xl">
                    {(Object.entries(SEARCH_FIELD_LABELS) as [SearchField, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => { setSearchField(key); setFieldDropdownOpen(false); }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-800 ${
                          searchField === key ? "text-emerald-400" : "text-gray-300"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search by ${SEARCH_FIELD_LABELS[searchField].toLowerCase()}…`}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort buttons */}
            <div className="flex flex-wrap gap-2 shrink-0">
              {(Object.entries(SORT_FIELD_LABELS) as [SortField, string][]).map(([field, label]) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    sortBy === field
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {label}
                  <SortIcon field={field} active={sortBy} order={sortOrder} />
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: search field pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-gray-500">Search in:</span>
            {(Object.entries(SEARCH_FIELD_LABELS) as [SearchField, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setSearchField(key); setFieldDropdownOpen(false); }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  searchField === key
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-gray-800 bg-gray-900/70 shadow-xl backdrop-blur-xl overflow-hidden">
          {error && (
            <div className="px-6 py-4 text-sm text-red-400">{error}</div>
          )}

          {/* Count */}
          {!error && (
            <div className="px-6 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {isLoading
                  ? "Loading…"
                  : `${pagination.total.toLocaleString()} medicine${pagination.total !== 1 ? "s" : ""} found`}
              </span>
              {pagination.totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => handleSort("medicine_name")}
                  >
                    Medicine Name <SortIcon field="medicine_name" active={sortBy} order={sortOrder} />
                  </th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => handleSort("generic_name")}
                  >
                    Generic Name <SortIcon field="generic_name" active={sortBy} order={sortOrder} />
                  </th>
                  <th className="px-4 py-3">Strength</th>
                  <th className="px-4 py-3">Form</th>
                  <th
                    className="px-4 py-3 cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => handleSort("company_name")}
                  >
                    Company <SortIcon field="company_name" active={sortBy} order={sortOrder} />
                  </th>
                  <th
                    className="px-4 py-3 text-right cursor-pointer hover:text-gray-300 transition-colors"
                    onClick={() => handleSort("unit_price")}
                  >
                    Price <SortIcon field="unit_price" active={sortBy} order={sortOrder} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-3 rounded bg-gray-800" style={{ width: `${60 + Math.random() * 30}%` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : medicines.length === 0
                  ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          No medicines found.
                        </td>
                      </tr>
                    )
                  : medicines.map((med) => (
                      <tr
                        key={med._id}
                        className="border-b border-gray-800/40 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-white">{med.medicine_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{med.generic_name || "—"}</td>
                        <td className="px-4 py-3 text-gray-400">{med.strength || "—"}</td>
                        <td className="px-4 py-3">
                          {med.dosage_form ? (
                            <span className="inline-block rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                              {med.dosage_form}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400">{med.company_name || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {med.unit_price != null ? (
                            <span className="text-emerald-400 font-medium">৳{med.unit_price.toFixed(2)}</span>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => handlePage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                const half = 3;
                let start = Math.max(1, pagination.page - half);
                const end = Math.min(pagination.totalPages, start + 6);
                start = Math.max(1, end - 6);
                return start + i;
              }).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                    p === pagination.page
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => handlePage(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 disabled:opacity-40 hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </SuperAdminGuard>
  );
}
