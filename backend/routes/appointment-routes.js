import express from "express";
import {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getDoctorAppointments,
} from "../controllers/appointment-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, bookAppointment);
router.get("/my", verifyToken, getMyAppointments);
router.get("/doctor", verifyToken, getDoctorAppointments);
router.patch("/:id/cancel", verifyToken, cancelAppointment);

export default router;
