import { Medicine } from "../models/medicine.js";

export const searchMedicines = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const query = String(q).trim();

    if (!query || query.length < 2) {
      return res.json({ success: true, medicines: [] });
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(escaped, "i");

    const medicines = await Medicine.find({ medicine_name: rx })
      .select("medicine_name generic_name strength dosage_form company_name unit_price")
      .limit(10)
      .lean();

    res.json({ success: true, medicines });
  } catch (err) {
    console.error("searchMedicines error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
