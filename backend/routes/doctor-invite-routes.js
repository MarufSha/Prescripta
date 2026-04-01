import express from "express";
import {
  getDoctorInviteByToken,
  acceptDoctorInvite,
} from "../controllers/doctor-invite-controller.js";

const router = express.Router();

router.get("/:token", getDoctorInviteByToken);
router.post("/:token/accept", acceptDoctorInvite);

export default router;
