import { Prescription } from "../models/prescription.js";

// ── helpers ───────────────────────────────────────────────────────────────────

const clean = (arr) =>
  Array.isArray(arr) ? arr.map((s) => String(s).trim()).filter(Boolean) : [];

// ── Create ────────────────────────────────────────────────────────────────────

export const createPrescription = async (req, res) => {
  try {
    const doctorId = req.userId;
    const {
      patientName,
      age,
      sex,
      mobile,
      weight,
      pulse,
      bp,
      spo2,
      others,
      date,
      chiefComplaints,
      diagnosis,
      medications,
      investigations,
      advice,
      followUpDays,
    } = req.body;

    // Required field validation
    if (!patientName || String(patientName).trim().length < 2)
      return res
        .status(400)
        .json({ success: false, message: "Patient name must be at least 2 characters" });

    if (age === undefined || age === null || isNaN(Number(age)))
      return res.status(400).json({ success: false, message: "Valid age is required" });

    if (!sex || !["Male", "Female", "Other"].includes(sex))
      return res.status(400).json({ success: false, message: "Valid sex is required" });

    if (!mobile || String(mobile).trim().length < 3)
      return res.status(400).json({ success: false, message: "Mobile number is required" });

    const cleanedComplaints = clean(chiefComplaints);
    if (!cleanedComplaints.length)
      return res
        .status(400)
        .json({ success: false, message: "At least one chief complaint is required" });

    // Determine patientUid and visitNumber
    const mobileClean = String(mobile).trim();
    const nameEscaped = String(patientName).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const [lastVisit] = await Prescription.find({
      doctorId,
      mobile: mobileClean,
      patientName: { $regex: new RegExp(`^${nameEscaped}$`, "i") },
    })
      .select("patientUid visitNumber")
      .sort({ visitNumber: -1 })
      .limit(1);

    let patientUid, visitNumber;
    if (lastVisit) {
      patientUid = lastVisit.patientUid;
      visitNumber = lastVisit.visitNumber + 1;
    } else {
      const uniquePatients = await Prescription.distinct("patientUid", { doctorId });
      patientUid = `P-${String(uniquePatients.length + 1).padStart(4, "0")}`;
      visitNumber = 1;
    }

    const cleanMeds = Array.isArray(medications)
      ? medications
          .filter((m) => m?.medicine?.trim())
          .map((m) => ({
            medicine: String(m.medicine).trim(),
            days: String(m.days || "").trim(),
            timesPerDay: String(m.timesPerDay || "").trim(),
            timing: String(m.timing || "").trim(),
          }))
      : [];

    const prescription = await Prescription.create({
      doctorId,
      patientUid,
      visitNumber,
      patientName: String(patientName).trim(),
      age: Number(age),
      sex,
      mobile: mobileClean,
      weight: weight ? Number(weight) : null,
      pulse: String(pulse || "").trim(),
      bp: String(bp || "").trim(),
      spo2: String(spo2 || "").trim(),
      others: String(others || "").trim(),
      date: date ? new Date(date) : new Date(),
      chiefComplaints: cleanedComplaints,
      diagnosis: clean(diagnosis),
      medications: cleanMeds,
      investigations: clean(investigations),
      advice: clean(advice),
      followUpDays: followUpDays ? Number(followUpDays) : null,
    });

    res.status(201).json({
      success: true,
      message: "Prescription saved successfully",
      prescription,
    });
  } catch (err) {
    console.error("createPrescription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── List ──────────────────────────────────────────────────────────────────────

export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.userId;
    const {
      page = 1,
      limit = 20,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { doctorId };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ patientName: rx }, { mobile: rx }, { patientUid: rx }];
    }

    const allowed = ["createdAt", "patientName", "date", "visitNumber", "age"];
    const sort = { [allowed.includes(sortBy) ? sortBy : "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort(sort)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Prescription.countDocuments(filter),
    ]);

    res.json({
      success: true,
      prescriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getDoctorPrescriptions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Get by ID ─────────────────────────────────────────────────────────────────

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.userId,
    }).lean();

    if (!prescription)
      return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, prescription });
  } catch (err) {
    console.error("getPrescriptionById error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: req.userId,
    });

    if (!prescription)
      return res.status(404).json({ success: false, message: "Prescription not found" });

    const editable = [
      "patientName","age","sex","mobile","weight","pulse","bp","spo2","others","date",
      "chiefComplaints","diagnosis","medications","investigations","advice","followUpDays",
    ];
    editable.forEach((f) => {
      if (req.body[f] !== undefined) prescription[f] = req.body[f];
    });

    await prescription.save();
    res.json({ success: true, message: "Prescription updated", prescription });
  } catch (err) {
    console.error("updatePrescription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deletePrescription = async (req, res) => {
  try {
    const result = await Prescription.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.userId,
    });

    if (!result)
      return res.status(404).json({ success: false, message: "Prescription not found" });

    res.json({ success: true, message: "Prescription deleted" });
  } catch (err) {
    console.error("deletePrescription error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
