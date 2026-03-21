import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  deletePendingSignup,
  requestManualVerification,
  getCsrfToken,
} from "../controllers/auth-controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";
import {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/authValidators.js";
import { requireCsrf } from "../middleware/requireCsrf.js";

const router = express.Router();

router.get("/csrf-token", getCsrfToken);
router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signupValidation, handleValidationErrors, signup);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post("/logout", verifyToken, requireCsrf, logout);

router.post(
  "/verify-email",
  verifyToken,
  requireCsrf,
  verifyEmailValidation,
  handleValidationErrors,
  verifyEmail,
);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  handleValidationErrors,
  forgotPassword,
);

router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  handleValidationErrors,
  resetPassword,
);

router.delete("/pending-signup", verifyToken, requireCsrf, deletePendingSignup);

router.post(
  "/request-manual-verification",
  verifyToken,
  requireCsrf,
  requestManualVerification,
);
export default router;
