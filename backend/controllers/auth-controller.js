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
  const { name, email, password, age, sex, mobileNumber } = matchedData(req);

  try {
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const mobileAlreadyExists = await User.findOne({ mobileNumber });
    if (mobileAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "An account with this mobile number already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      age,
      sex,
      mobileNumber,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000,
      activeSessionToken: crypto.randomBytes(32).toString("hex"),
      activeSessionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      heartbeatExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    await user.save();

    generateTokenAndSetCookie(res, user);
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
    const user = await User.findOne({ email }).select(
      "-resetPasswordToken -verificationToken",
    );

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

    if (user.activeSessionToken && user.heartbeatExpiresAt > new Date()) {
      return res.status(409).json({
        success: false,
        message:
          "This account is already logged in on another session. Please log out from that session first.",
      });
    }

    generateTokenAndSetCookie(res, user);
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);
    user.lastLogin = new Date();
    user.activeSessionToken = crypto.randomBytes(32).toString("hex");
    user.activeSessionExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );
    user.heartbeatExpiresAt = new Date(Date.now() + 2 * 60 * 1000);
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
  try {
    await User.findByIdAndUpdate(req.userId, {
      activeSessionToken: null,
      activeSessionExpiresAt: null,
      heartbeatExpiresAt: null,
    });
  } catch (error) {
    console.error("Error clearing session on logout:", error);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    path: "/",
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };
  res.clearCookie("token", { ...cookieOptions, httpOnly: true });
  res.clearCookie("csrfToken", { ...cookieOptions, httpOnly: false });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = matchedData(req);

  try {
    const user = await User.findOne({ email }).select(
      "-password -verificationToken",
    );

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
    }).select("-verificationToken");

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
    const user = await User.findById(req.userId).select(
      "-password -resetPasswordToken -verificationToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    void User.updateOne(
      { _id: req.userId },
      { heartbeatExpiresAt: new Date(Date.now() + 2 * 60 * 1000) },
    );

    // Must never be cached by the browser: a page reload right after logout
    // (or after the session expires) must always hit the server, otherwise a
    // stale cached "Authenticated" response makes the client look logged in
    // even though the session cookie was already cleared.
    res.set("Cache-Control", "no-store");

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

    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

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

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const { name, age, sex, mobileNumber, doctorProfile } = req.body;

    if (name !== undefined) {
      const trimmed = String(name).trim();
      if (trimmed.length < 2 || trimmed.length > 50)
        return res
          .status(400)
          .json({ success: false, message: "Name must be 2–50 characters" });
      user.name = trimmed;
    }

    if (age !== undefined) {
      const parsed = parseInt(age);
      if (isNaN(parsed) || parsed < 1 || parsed > 120)
        return res
          .status(400)
          .json({ success: false, message: "Age must be between 1 and 120" });
      user.age = parsed;
    }

    if (sex !== undefined) {
      if (!["Male", "Female", "Other"].includes(sex))
        return res
          .status(400)
          .json({
            success: false,
            message: "Sex must be Male, Female, or Other",
          });
      user.sex = sex;
    }

    if (mobileNumber !== undefined) {
      const trimmed = String(mobileNumber).trim();
      if (trimmed) {
        const duplicate = await User.findOne({
          mobileNumber: trimmed,
          _id: { $ne: user._id },
        });
        if (duplicate)
          return res
            .status(409)
            .json({
              success: false,
              message: "An account with this mobile number already exists",
            });
        user.mobileNumber = trimmed;
      }
    }

    if (doctorProfile !== undefined && user.role === "doctor") {
      const dp = doctorProfile;
      const DAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      user.doctorProfile = {
        specialties: Array.isArray(dp.specialties)
          ? dp.specialties.map(String).filter(Boolean)
          : (user.doctorProfile?.specialties ?? []),
        bmdcNo:
          dp.bmdcNo !== undefined
            ? String(dp.bmdcNo ?? "").trim()
            : (user.doctorProfile?.bmdcNo ?? ""),
        mobileNumber:
          dp.mobileNumber !== undefined
            ? String(dp.mobileNumber ?? "").trim()
            : (user.doctorProfile?.mobileNumber ?? ""),
        designations: Array.isArray(dp.designations)
          ? dp.designations.map(String).filter(Boolean)
          : (user.doctorProfile?.designations ?? []),
        degrees: Array.isArray(dp.degrees)
          ? dp.degrees.map(String).filter(Boolean)
          : (user.doctorProfile?.degrees ?? []),
        chambers: Array.isArray(dp.chambers)
          ? dp.chambers
              .filter((c) => c?.name?.trim() && c?.location?.trim())
              .map((c) => ({
                name: String(c.name).trim(),
                location: String(c.location).trim(),
              }))
          : (user.doctorProfile?.chambers ?? []),
        availability: Array.isArray(dp.availability)
          ? dp.availability
              .filter(
                (a) =>
                  a?.day && DAYS.includes(a.day) && a?.startTime && a?.endTime,
              )
              .map((a) => ({
                day: a.day,
                startTime: String(a.startTime).trim(),
                endTime: String(a.endTime).trim(),
              }))
          : (user.doctorProfile?.availability ?? []),
      };
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile updated",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", isVerified: true })
      .select("name email doctorProfile")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      doctors: doctors.map((d) => ({
        _id: d._id,
        name: d.name,
        email: d.email,
        doctorProfile: d.doctorProfile,
      })),
    });
  } catch (error) {
    console.error("getDoctors error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};