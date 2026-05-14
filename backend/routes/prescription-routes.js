import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import { requireCsrf } from "../middleware/requireCsrf.js";
import {
  createPrescription,
  getDoctorPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getPatientHistory,
} from "../controllers/prescription-controller.js";

const router = express.Router();

router.use(verifyToken, requireRole("doctor"));

router.get("/", getDoctorPrescriptions);
router.get("/patient-history", getPatientHistory);
router.get("/:id", getPrescriptionById);
router.post("/", requireCsrf, createPrescription);
router.put("/:id", requireCsrf, updatePrescription);
router.delete("/:id", requireCsrf, deletePrescription);

export default router;
