import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  updateUserRole,
  getAllUsers,
  verifyUserManually,
} from "../controllers/admin-controller.js";

const router = express.Router();
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);
router.patch(
  "/users/:id/role",
  verifyToken,
  requireRole("admin"),
  updateUserRole,
);
router.patch(
  "/users/:id/verify",
  verifyToken,
  requireRole("admin"),
  verifyUserManually,
);
export default router;
