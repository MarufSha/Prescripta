import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  updateUserRole,
  getAllUsers,
  verifyUserManually,
  deleteUserByAdmin,
} from "../controllers/admin-controller.js";
import { requireCsrf } from "../middleware/requireCsrf.js";
import { createDoctorInvite } from "../controllers/admin-controller.js";
const router = express.Router();
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);
router.patch(
  "/users/:id/role",
  verifyToken,
  requireRole("admin"),
  requireCsrf,
  updateUserRole,
);
router.patch(
  "/users/:id/verify",
  verifyToken,
  requireRole("admin"),
  requireCsrf,
  verifyUserManually,
);
router.delete(
  "/users/:id",
  verifyToken,
  requireRole("admin"),
  requireCsrf,
  deleteUserByAdmin,
);
router.post(
  "/doctor-invites",
  verifyToken,
  requireRole("admin"),
  requireCsrf,
  createDoctorInvite,
);
export default router;
