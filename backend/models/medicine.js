import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    raw: { type: String },
    unitPrice: { type: Number, default: null },
    packPrice: { type: Number, default: null },
    packInfo: { type: String, default: null },
  },
  { _id: false }
);

const medicineSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    medicineName: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true, default: "" },
    strength: { type: String, trim: true, default: "" },
    dosageForm: { type: String, trim: true, default: "" },
    price: { type: priceSchema, default: () => ({}) },
    url: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// Full-text search index
medicineSchema.index({ medicineName: "text", genericName: "text" });

// Query indexes
medicineSchema.index({ medicineName: 1 });
medicineSchema.index({ genericName: 1 });
medicineSchema.index({ companyName: 1 });
medicineSchema.index({ dosageForm: 1 });

// Compound unique key to prevent duplicates on re-import
medicineSchema.index(
  { medicineName: 1, companyName: 1, strength: 1, dosageForm: 1 },
  { unique: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
