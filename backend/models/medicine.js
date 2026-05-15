import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    company_name: { type: String },
    medicine_name: { type: String, index: true },
    generic_name: { type: String },
    strength: { type: String },
    dosage_form: { type: String },
    unit_type: { type: String },
    unit_price: { type: Number },
  },
  { collection: "medicines", timestamps: false }
);

medicineSchema.index({ medicine_name: "text", generic_name: "text" });

export const Medicine = mongoose.model("Medicine", medicineSchema);
