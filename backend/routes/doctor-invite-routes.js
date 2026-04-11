import express from "express";
import {
  getDoctorInviteByToken,
  acceptDoctorInvite,
} from "../controllers/doctor-invite-controller.js";
import { requireCsrf } from "../middleware/requireCsrf.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";
import { acceptDoctorInviteValidation } from "../validators/doctorInviteValidators.js";

const router = express.Router();

router.get("/:token", getDoctorInviteByToken);
router.post(
  "/:token/accept",
  requireCsrf,
  acceptDoctorInviteValidation,
  handleValidationErrors,
  acceptDoctorInvite,
);

export default router;
