import crypto from "crypto";
import { User } from "../models/user.js";
import { DoctorInvite } from "../models/doctorInvite.js";
import { sendDoctorInviteEmail, sendWelcomeEmail } from "../mail/emails.js";

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => String(item).trim()).filter(Boolean);
};

const sanitizeDoctorProfile = (doctorProfile) => {
  if (!doctorProfile) return undefined;

  return {
    specialties: normalizeStringArray(doctorProfile.specialties),
    bmdcNo: doctorProfile.bmdcNo ? String(doctorProfile.bmdcNo).trim() : "",
    mobileNumber: doctorProfile.mobileNumber
      ? String(doctorProfile.mobileNumber).trim()
      : "",
    designations: normalizeStringArray(doctorProfile.designations),
    degrees: normalizeStringArray(doctorProfile.degrees),
    chambers: Array.isArray(doctorProfile.chambers)
      ? doctorProfile.chambers
          .map((chamber) => ({
            name: String(chamber?.name || "").trim(),
            location: String(chamber?.location || "").trim(),
          }))
          .filter((chamber) => chamber.name && chamber.location)
      : [],
  };
};

const validateDoctorProfile = (doctorProfile) => {
  if (!doctorProfile || typeof doctorProfile !== "object") {
    return "Doctor profile is required";
  }

  const specialties = normalizeStringArray(doctorProfile.specialties);
  const designations = normalizeStringArray(doctorProfile.designations);
  const degrees = normalizeStringArray(doctorProfile.degrees);

  const bmdcNo = String(doctorProfile.bmdcNo || "").trim();
  const mobileNumber = String(doctorProfile.mobileNumber || "").trim();

  const chambers = Array.isArray(doctorProfile.chambers)
    ? doctorProfile.chambers
        .map((chamber) => ({
          name: String(chamber?.name || "").trim(),
          location: String(chamber?.location || "").trim(),
        }))
        .filter((chamber) => chamber.name || chamber.location)
    : [];

  if (specialties.length === 0) {
    return "At least one specialty is required";
  }

  if (!bmdcNo) {
    return "BMDC No. is required";
  }

  if (bmdcNo.length > 20) {
    return "BMDC No. must be at most 20 characters long";
  }

  if (!mobileNumber) {
    return "Mobile number is required";
  }

  if (mobileNumber.length > 20) {
    return "Mobile number must be at most 20 characters long";
  }

  if (designations.length === 0) {
    return "At least one designation is required";
  }

  if (degrees.length === 0) {
    return "At least one degree is required";
  }

  if (chambers.length === 0) {
    return "At least one chamber is required";
  }

  const invalidChamber = chambers.find(
    (chamber) => !chamber.name || !chamber.location,
  );

  if (invalidChamber) {
    return "Each chamber must have both chamber name and chamber location";
  }

  return null;
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  lastLogin: user.lastLogin,
  manualVerificationRequested: user.manualVerificationRequested,
  manualVerificationRequestedAt: user.manualVerificationRequestedAt,
  doctorProfile: sanitizeDoctorProfile(user.doctorProfile),
});

export const createDoctorInvite = async (req, res) => {
  const { name, email } = req.body;

  try {
    const trimmedName = String(name || "").trim();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Doctor name is required",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Doctor email is required",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const existingInvite = await DoctorInvite.findOne({
      email: normalizedEmail,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvite) {
      return res.status(409).json({
        success: false,
        message: "An active doctor invite already exists for this email",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = new DoctorInvite({
      name: trimmedName,
      email: normalizedEmail,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      used: false,
      invitedBy: req.userId,
    });

    await invite.save();

    const inviteLink = `${process.env.CLIENT_URL}/doctor-invite/${token}`;

    await sendDoctorInviteEmail(normalizedEmail, trimmedName, inviteLink);

    return res.status(201).json({
      success: true,
      message: "Doctor invite sent successfully",
    });
  } catch (error) {
    console.error("Error creating doctor invite:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating doctor invite",
    });
  }
};

export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role, doctorProfile } = req.body;

  try {
    if (!["doctor", "patient"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (req.userId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const actingUser = req.user;

    if (!actingUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "superadmin" && actingUser.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can modify another superadmin",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin roles cannot be changed",
      });
    }

    if (role === "doctor") {
      const validationError = validateDoctorProfile(doctorProfile);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      user.role = "doctor";
      user.doctorProfile = sanitizeDoctorProfile(doctorProfile);
    }

    if (role === "patient") {
      user.role = "patient";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating user role",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({
      role: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users",
    });
  }
};

export const verifyUserManually = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

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

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.manualVerificationRequested = false;
    user.manualVerificationRequestedAt = null;

    await user.save();
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "User verified successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Error verifying user manually:", error);
    return res.status(500).json({
      success: false,
      message: "Server error verifying user manually",
    });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.userId === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const actingUser = req.user;

    if (!actingUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "superadmin" && actingUser.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can delete another superadmin",
      });
    }

    if (user.role === "admin" && actingUser.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can delete admin accounts",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting user",
    });
  }
};
