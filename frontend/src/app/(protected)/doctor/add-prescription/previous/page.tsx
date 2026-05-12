"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Pencil,
  Download,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { usePrescriptionStore, type Prescription } from "@/store/prescriptionStore";

// ── Sort options ──────────────────────────────────────────────────────────────

const SORT_FIELDS = [
  { label: "Date", value: "createdAt" },
  { label: "Name", value: "patientName" },
  { label: "Age", value: "age" },
  { label: "Visit", value: "visitNumber" },
];

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function followUpDate(dateStr: string, days: number) {
  return new Date(new Date(dateStr).getTime() + days * 86400000).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Delete confirmation dialog ────────────────────────────────────────────────

function DeleteDialog({
  name,
  onConfirm,
  onCancel,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-2xl"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Delete Prescription?</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete the prescription for{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>. This
              action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Prescription card ─────────────────────────────────────────────────────────

function PrescriptionCard({
  prescription,
  index,
  onEdit,
  onDelete,
  onPrint,
}: {
  prescription: Prescription;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onPrint: () => void;
}) {
  const p = prescription;
  const dateLabel = formatDate(p.date || p.createdAt);
  const fuDate =
    p.followUpDays && p.date ? followUpDate(p.date, p.followUpDays) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/70 p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Info */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              #{index + 1} · {p.patientName} · {p.age} · {p.sex}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Visit: {p.visitNumber}
            </span>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              PUID: {p.patientUid}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
            <span>Date: {dateLabel}</span>
            <span>Mobile: {p.mobile}</span>
          </div>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
            {p.chiefComplaints.length > 0 && (
              <span>
                CC: {p.chiefComplaints.slice(0, 2).join(", ")}
                {p.chiefComplaints.length > 2 && ` +${p.chiefComplaints.length - 2} more`}
              </span>
            )}
            {p.medications.length > 0 && (
              <span>RX items: {p.medications.length}</span>
            )}
          </div>

          {fuDate && (
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Follow up: {fuDate}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800/50 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Print single prescription ─────────────────────────────────────────────────

function printPrescription(p: Prescription) {
  const fuDate =
    p.followUpDays && p.date ? followUpDate(p.date, p.followUpDays) : null;

  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) return;

  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>Prescription – ${p.patientName}</title>
    <style>
      body { font-family: sans-serif; font-size: 13px; padding: 32px; color: #000; }
      h1 { font-size: 18px; margin: 0; }
      .sub { font-size: 11px; color: #555; margin-bottom: 16px; }
      .grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 4px 16px; margin-bottom: 12px; font-size: 12px; }
      .vitals { display: flex; gap: 16px; font-size: 12px; margin-bottom: 12px; }
      h3 { font-size: 13px; margin: 8px 0 4px; }
      ul { margin: 0 0 8px 16px; padding: 0; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
      th,td { text-align: left; padding: 4px 8px 4px 0; border-bottom: 1px solid #ddd; }
      th { font-weight: 600; }
      .fu { font-weight: 600; margin-top: 16px; }
      hr { border: none; border-top: 2px solid #333; margin-bottom: 12px; }
    </style></head><body>
    <h1>Prescripta</h1><p class="sub">Medical Prescription</p><hr/>
    <div class="grid">
      <div><b>Patient:</b> ${p.patientName}</div>
      <div><b>Age:</b> ${p.age}</div>
      <div><b>Sex:</b> ${p.sex}</div>
      <div><b>Mobile:</b> ${p.mobile}</div>
      ${p.weight ? `<div><b>Weight:</b> ${p.weight} kg</div>` : ""}
      <div><b>Date:</b> ${formatDate(p.date || p.createdAt)}</div>
      <div><b>PUID:</b> ${p.patientUid}</div>
      <div><b>Visit:</b> ${p.visitNumber}</div>
    </div>
    ${[p.pulse, p.bp, p.spo2].some(Boolean) ? `
    <div class="vitals">
      ${p.pulse ? `<span><b>Pulse:</b> ${p.pulse}</span>` : ""}
      ${p.bp ? `<span><b>BP:</b> ${p.bp}</span>` : ""}
      ${p.spo2 ? `<span><b>SpO2:</b> ${p.spo2}</span>` : ""}
    </div>` : ""}
    ${p.chiefComplaints.length ? `<h3>C/C:</h3><ul>${p.chiefComplaints.map((c) => `<li>${c}</li>`).join("")}</ul>` : ""}
    ${p.diagnosis.length ? `<h3>D/x:</h3><ul>${p.diagnosis.map((d) => `<li>${d}</li>`).join("")}</ul>` : ""}
    ${p.medications.length ? `
    <h3>R/X:</h3>
    <table><thead><tr><th>Medicine</th><th>Days</th><th>Times/Day</th><th>Timing</th></tr></thead>
    <tbody>${p.medications.map((m) => `<tr><td>${m.medicine}</td><td>${m.days}</td><td>${m.timesPerDay}</td><td>${m.timing}</td></tr>`).join("")}</tbody>
    </table>` : ""}
    ${p.investigations.length ? `<h3>Investigations:</h3><ul>${p.investigations.map((v) => `<li>${v}</li>`).join("")}</ul>` : ""}
    ${p.advice.length ? `<h3>Advice:</h3><ul>${p.advice.map((a) => `<li>${a}</li>`).join("")}</ul>` : ""}
    ${fuDate ? `<p class="fu">Follow up: ${fuDate}</p>` : ""}
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script>
    </body></html>
  `);
  win.document.close();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PreviousPrescriptionsPage() {
  const router = useRouter();
  const { prescriptions, pagination, isLoading, fetchPrescriptions, deletePrescription } =
    usePrescriptionStore();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Prescription | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);

  const load = useCallback(() => {
    void fetchPrescriptions({ page, limit: 15, search, sortBy, sortOrder });
  }, [fetchPrescriptions, page, search, sortBy, sortOrder]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      await deletePrescription(deleteTarget._id);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleClearAll = async () => {
    setClearConfirm(false);
    for (const p of prescriptions) {
      await deletePrescription(p._id);
    }
    load();
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  return (
    <>
      {deleteTarget && (
        <DeleteDialog
          name={deleteTarget.patientName}
          onConfirm={() => void handleDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {clearConfirm && (
        <DeleteDialog
          name={`all ${prescriptions.length} prescriptions on this page`}
          onConfirm={() => void handleClearAll()}
          onCancel={() => setClearConfirm(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto max-w-4xl space-y-4"
      >
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Previous Prescriptions
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/doctor/add-prescription")}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Create
            </button>
            {prescriptions.length > 0 && (
              <button
                type="button"
                onClick={() => setClearConfirm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Sort buttons */}
          <div className="flex flex-wrap gap-2">
            {SORT_FIELDS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => toggleSort(f.value)}
                className={[
                  "inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  sortBy === f.value
                    ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300",
                ].join(" ")}
              >
                {f.label}
                {sortBy === f.value && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-colors cursor-pointer"
            >
              {sortOrder === "desc" ? "Descending" : "Ascending"}
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, mobile, PUID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Count */}
        {!isLoading && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {pagination.total} prescription{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}

        {/* List */}
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
            <p className="text-sm font-medium">No prescriptions found</p>
            {search && <p className="text-xs">Try a different search term</p>}
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {prescriptions.map((p, i) => (
                <PrescriptionCard
                  key={p._id}
                  prescription={p}
                  index={(page - 1) * 15 + i}
                  onEdit={() => router.push(`/doctor/add-prescription?edit=${p._id}`)}
                  onDelete={() => setDeleteTarget(p)}
                  onPrint={() => printPrescription(p)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page === pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
