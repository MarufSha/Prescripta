import express from "express";
import { searchMedicines, listMedicines } from "../controllers/medicine-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/search", verifyToken, searchMedicines);
router.get("/", verifyToken, requireRole("admin", "superadmin"), listMedicines);

export default router;
