import { Medicine } from "../models/medicine.js";

export const searchMedicines = async (req, res) => {
  try {
    const { q = "", field = "medicine_name" } = req.query;
    const query = String(q).trim();
    const searchField = ["medicine_name", "generic_name"].includes(field)
      ? field
      : "medicine_name";

    if (!query || query.length < 2) {
      return res.json({ success: true, medicines: [] });
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Brand name: prefix match; generic name: substring match
    const rx =
      searchField === "generic_name"
        ? new RegExp(escaped, "i")
        : new RegExp(`^${escaped}`, "i");

    const medicines = await Medicine.find({ [searchField]: rx })
      .select("medicine_name generic_name strength dosage_form unit_type company_name unit_price")
      .limit(10)
      .lean();

    res.json({ success: true, medicines });
  } catch (err) {
    console.error("searchMedicines error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const ALLOWED_SORT_FIELDS = ["medicine_name", "company_name", "unit_price", "generic_name"];
const ALLOWED_SEARCH_FIELDS = ["medicine_name", "company_name", "generic_name", "dosage_form"];

export const listMedicines = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const search = String(req.query.search || "").trim();
    const searchField = ALLOWED_SEARCH_FIELDS.includes(req.query.searchField)
      ? req.query.searchField
      : "medicine_name";
    const sortBy = ALLOWED_SORT_FIELDS.includes(req.query.sortBy)
      ? req.query.sortBy
      : "medicine_name";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    const filter = {};
    if (search.length >= 1) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter[searchField] = new RegExp(escaped, "i");
    }

    const skip = (page - 1) * limit;
    const [medicines, total] = await Promise.all([
      Medicine.find(filter)
        .select("medicine_name generic_name strength dosage_form unit_type company_name unit_price")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Medicine.countDocuments(filter),
    ]);

    res.json({
      success: true,
      medicines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("listMedicines error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
