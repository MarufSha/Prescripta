import { matchedData } from "express-validator";
import { User } from "../models/user.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { generateVerificationToken } from "../utils/generateVerificationToken.js";
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendResetSuccessEmail,
} from "../mail/emails.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateCsrfToken, setCsrfCookie } from "../utils/csrf.js";
const sanitizeUser = (user) => ({
  ...user._doc,
  password: undefined,
});

export const signup = async (req, res) => {
  const { name, email, password } = matchedData(req);

  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = matchedData(req);

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error during email verification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = matchedData(req);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    generateTokenAndSetCookie(res, user._id);
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.clearCookie("csrfToken", { path: "/" });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = matchedData(req);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists for this email, a password reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    await sendResetPasswordEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`,
    );

    return res.status(200).json({
      success: true,
      message:
        "If an account exists for this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Error during forgot password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during forgot password",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { newPassword } = matchedData(req);
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    await sendResetSuccessEmail(user.email);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error during password reset:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Authenticated",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error during check auth:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during check auth",
    });
  }
};

export const deletePendingSignup = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verified users cannot delete pending signup this way",
      });
    }

    if (user.manualVerificationRequested) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete signup after manual verification has been requested",
      });
    }

    await User.findByIdAndDelete(user._id);

    res.clearCookie("token");

    return res.status(200).json({
      success: true,
      message: "Pending signup deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pending signup:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting pending signup",
    });
  }
};

export const requestManualVerification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    if (user.manualVerificationRequested) {
      return res.status(400).json({
        success: false,
        message: "Manual verification has already been requested",
      });
    }

    user.manualVerificationRequested = true;
    user.manualVerificationRequestedAt = new Date();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Manual verification request sent successfully",
    });
  } catch (error) {
    console.error("Error requesting manual verification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error requesting manual verification",
    });
  }
};
export const getCsrfToken = async (req, res) => {
  try {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      success: true,
      csrfToken,
    });
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return res.status(500).json({
      success: false,
      message: "Server error generating CSRF token",
    });
  }
};
