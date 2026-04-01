import bcrypt from "bcryptjs";
import { DoctorInvite } from "../models/doctorInvite.js";
import { User } from "../models/user.js";
import { sendWelcomeEmail } from "../mail/emails.js";

const normalizeStringArray = (value) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => String(item).trim()).filter(Boolean);
};

const sanitizeDoctorProfile = (doctorProfile) => ({
  specialties: normalizeStringArray(doctorProfile.specialties),
  bmdcNo: String(doctorProfile.bmdcNo || "").trim(),
  mobileNumber: String(doctorProfile.mobileNumber || "").trim(),
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
});

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

  if (specialties.length === 0) return "At least one specialty is required";
  if (!bmdcNo) return "BMDC No. is required";
  if (!mobileNumber) return "Mobile number is required";
  if (designations.length === 0) return "At least one designation is required";
  if (degrees.length === 0) return "At least one degree is required";
  if (chambers.length === 0) return "At least one chamber is required";

  const invalidChamber = chambers.find(
    (chamber) => !chamber.name || !chamber.location,
  );

  if (invalidChamber) {
    return "Each chamber must have both chamber name and chamber location";
  }

  return null;
};

export const getDoctorInviteByToken = async (req, res) => {
  const { token } = req.params;

  try {
    const invite = await DoctorInvite.findOne({ token });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invite",
      });
    }

    return res.status(200).json({
      success: true,
      invite: {
        name: invite.name,
        email: invite.email,
      },
    });
  } catch (error) {
    console.error("Error validating doctor invite:", error);
    return res.status(500).json({
      success: false,
      message: "Server error validating doctor invite",
    });
  }
};

export const acceptDoctorInvite = async (req, res) => {
  const { token } = req.params;
  const { password, doctorProfile } = req.body;

  try {
    const invite = await DoctorInvite.findOne({ token });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired invite",
      });
    }

    const existingUser = await User.findOne({ email: invite.email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    if (!password || String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const validationError = validateDoctorProfile(doctorProfile);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: invite.name,
      email: invite.email,
      password: hashedPassword,
      role: "doctor",
      isVerified: true,
      doctorProfile: sanitizeDoctorProfile(doctorProfile),
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined,
      manualVerificationRequested: false,
      manualVerificationRequestedAt: null,
    });

    await user.save();

    invite.used = true;
    await invite.save();

    await sendWelcomeEmail(user.email, user.name);

    return res.status(201).json({
      success: true,
      message: "Doctor account created successfully",
    });
  } catch (error) {
    console.error("Error accepting doctor invite:", error);
    return res.status(500).json({
      success: false,
      message: "Server error accepting doctor invite",
    });
  }
};
