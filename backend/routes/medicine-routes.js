import express from "express";
import { searchMedicines } from "../controllers/medicine-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/search", verifyToken, searchMedicines);

export default router;
