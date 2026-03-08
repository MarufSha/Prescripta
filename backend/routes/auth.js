import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { handleValidationErrors } from "../middleware/handleValidationErrors.js";
import {
  signupValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validators/authValidators.js";

const router = express.Router();
router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signupValidation, handleValidationErrors, signup);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmailValidation, handleValidationErrors, verifyEmail);
router.post("/forgot-password", forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidation, handleValidationErrors, resetPassword);

export default router;