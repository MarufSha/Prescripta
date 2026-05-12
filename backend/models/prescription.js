import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema(
  {
    medicine: { type: String, required: true, trim: true },
    days: { type: String, trim: true, default: "" },
    timesPerDay: { type: String, trim: true, default: "" },
    timing: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Auto-assigned patient identifier per doctor (P-0001, P-0002, …)
    patientUid: { type: String, default: "" },
    // How many times this patient (mobile) has visited this doctor
    visitNumber: { type: Number, default: 1 },

    // ── Patient info ──────────────────────────────────────────────
    patientName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    age: { type: Number, required: true, min: 0, max: 150 },
    sex: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    mobile: { type: String, required: true, trim: true, maxlength: 20 },

    // ── Vitals ────────────────────────────────────────────────────
    weight: { type: Number, default: null },
    pulse: { type: String, trim: true, default: "" },
    bp: { type: String, trim: true, default: "" },
    spo2: { type: String, trim: true, default: "" },
    others: { type: String, trim: true, default: "" },
    date: { type: Date, default: Date.now },

    // ── Clinical data ─────────────────────────────────────────────
    chiefComplaints: [{ type: String, trim: true }],
    diagnosis: [{ type: String, trim: true }],
    medications: [medicationSchema],
    investigations: [{ type: String, trim: true }],
    advice: [{ type: String, trim: true }],
    followUpDays: { type: Number, default: null, min: 1 },
  },
  { timestamps: true }
);

prescriptionSchema.index({ doctorId: 1, createdAt: -1 });
prescriptionSchema.index({ doctorId: 1, mobile: 1 });
prescriptionSchema.index({ doctorId: 1, patientName: 1 });

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
