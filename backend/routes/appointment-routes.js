import express from "express";
import {
  bookAppointment,
  getMyAppointments,
} from "../controllers/appointment-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, bookAppointment);
router.get("/my", verifyToken, getMyAppointments);

export default router;
