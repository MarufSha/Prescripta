import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
} from "../controllers/appointment-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, bookAppointment);
router.get("/my", verifyToken, getMyAppointments);
router.patch("/:id/cancel", verifyToken, cancelAppointment);

export default router;
